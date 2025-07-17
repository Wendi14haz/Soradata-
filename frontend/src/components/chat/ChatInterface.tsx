import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Paperclip, User } from 'lucide-react';
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFileProcessing } from '@/hooks/useFileProcessing';
import { supabase } from '@/integrations/supabase/client';
import { ChatActionButtons } from './ChatActionButtons';
import { DataVisualizationCard } from '@/components/visualization/DataVisualizationCard';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachedFiles?: Array<{
    name: string;
    type: string;
    size: number;
    content?: string;
  }>;
  fileData?: any;
  showActions?: boolean;
  visualizationRequest?: boolean;
  insightRequest?: boolean;
}

interface ChatInterfaceProps {
  chatHistory?: Message[];
  onChatUpdate?: (messages: Message[]) => void;
  threadId?: string;
  sidebarCollapsed?: boolean;
}

// Generate UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const ChatInterface = ({
  chatHistory = [],
  onChatUpdate,
  threadId,
  sidebarCollapsed = false
}: ChatInterfaceProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { processAndSaveFile, isProcessing } = useFileProcessing();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  const handleSendMessage = useCallback(async (customMessage?: string) => {
    const messageText = customMessage || message.trim();
    if ((!messageText && attachedFiles.length === 0) || !user || isLoading) return;

    let finalMessageText = messageText;
    let filesData: any[] = [];
    setError(null);

    if (attachedFiles.length > 0) {
      try {
        for (const file of attachedFiles) {
          const isDataFile = ['.csv', '.xlsx', '.xls', '.json'].some(ext =>
            file.name.toLowerCase().endsWith(ext)
          );

          if (isDataFile) {
            const processedFile = await processAndSaveFile(file);
            if (processedFile) {
              setUploadedFile(processedFile);
              filesData.push({
                name: file.name,
                type: file.type,
                size: file.size,
                processedData: processedFile.processedData,
                metadata: processedFile.metadata
              });
            }
          } else {
            filesData.push({
              name: file.name,
              type: file.type,
              size: file.size
            });
          }
        }

        if (!finalMessageText) {
          finalMessageText = filesData.length === 1
            ? `📁 File "${filesData[0].name}" berhasil diupload.`
            : `📁 ${filesData.length} file berhasil diupload.`;
        } else {
          const fileNames = filesData.map(f => f.name).join(', ');
          finalMessageText += `\n\n📁 File terlampir: ${fileNames}`;
        }
      } catch (error: any) {
        setError(`Error processing files: ${error.message}`);
        toast({
          title: "❌ Upload Gagal",
          description: error.message || "Terjadi kesalahan saat mengupload file",
          variant: "destructive",
        });
        return;
      }
    }

    const newMessage: Message = {
      id: generateUUID(),
      text: finalMessageText,
      isUser: true,
      timestamp: new Date(),
      attachedFiles: filesData.length > 0 ? filesData : undefined
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      let filesContent = '';
      if (filesData.length > 0) {
        filesContent = filesData.map(f => JSON.stringify({
          type: f.processedData ? 'processed_data' : 'file',
          filename: f.name,
          size: f.size,
          sample: f.processedData ? f.processedData.slice(0, 10) : undefined
        })).join('\n\n');
      }

      const { data, error: functionError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: newMessage.text,
          chatHistory: messages.slice(-5),
          filesContent,
          fileData: uploadedFile
        }
      });

      if (functionError) throw functionError;

      const aiResponse: Message = {
        id: generateUUID(),
        text: data?.response || "Maaf, terjadi kesalahan.",
        isUser: false,
        timestamp: new Date(),
        showActions: uploadedFile && finalMessageText.toLowerCase().includes('analisis'),
        fileData: uploadedFile
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      onChatUpdate?.(finalMessages);

      setError(null);

    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan.');
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });

      const errorResponse: Message = {
        id: generateUUID(),
        text: "Maaf, saya sedang mengalami gangguan. Silakan coba lagi.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages([...updatedMessages, errorResponse]);
      onChatUpdate?.([...updatedMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [message, attachedFiles, user, isLoading, messages, uploadedFile, processAndSaveFile, toast, onChatUpdate]);

  const handleVisualization = useCallback(() => {
    if (!uploadedFile) return;
    const vizMessage: Message = {
      id: generateUUID(),
      text: `📊 Membuat visualisasi untuk data "${uploadedFile?.fileName}".`,
      isUser: false,
      timestamp: new Date(),
      visualizationRequest: true,
      fileData: uploadedFile
    };
    const updatedMessages = [...messages, vizMessage];
    setMessages(updatedMessages);
    onChatUpdate?.(updatedMessages);
  }, [uploadedFile, messages, onChatUpdate]);

  const handleInsights = useCallback(() => {
    handleSendMessage(`💡 Temukan insight dari data "${uploadedFile?.fileName}".`);
  }, [uploadedFile, handleSendMessage]);

  const handleSummary = useCallback(() => {
    handleSendMessage(`📝 Buatkan ringkasan data "${uploadedFile?.fileName}".`);
  }, [uploadedFile, handleSendMessage]);

  const handleTrends = useCallback(() => {
    handleSendMessage(`📈 Analisis tren data "${uploadedFile?.fileName}".`);
  }, [uploadedFile, handleSendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + attachedFiles.length > 5) {
      toast({
        title: "❌ Terlalu Banyak File",
        description: "Maksimal 5 file",
        variant: "destructive",
      });
      return;
    }
    setAttachedFiles(prev => [...prev, ...files]);
    toast({
      title: "✅ File Terpilih",
      description: `${files.length} file siap dikirim`,
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatDateTime = (date: Date) =>
    `${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} • ${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\s/g, '-')}`;

  const mainContent = useMemo(() => (
    <div className="space-y-8 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}
      {messages.map((msg) => (
        <div key={msg.id} className="space-y-3">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {msg.isUser ? (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              ) : (
                <img src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" alt="Soradata" className="w-8 h-8 object-contain" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{msg.text}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatDateTime(msg.timestamp)}</span>
              </div>
            </div>
          </div>

          {msg.showActions && uploadedFile && (
            <ChatActionButtons
              onVisualize={handleVisualization}
              onInsights={handleInsights}
              onSummary={handleSummary}
              onTrends={handleTrends}
              onLike={() => console.log('👍 Like')}
              onDislike={() => console.log('👎 Dislike')}
              onCopy={() => navigator.clipboard.writeText(msg.text)}
              onDownload={() => {
                const blob = new Blob([msg.text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-${msg.id}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
          )}

          {msg.visualizationRequest && msg.fileData && (
            <DataVisualizationCard
              data={msg.fileData.processedData}
              fileName={msg.fileData.fileName}
            />
          )}
        </div>
      ))}
      {(isLoading || isProcessing) && (
        <div className="flex items-start space-x-4">
          <img src="/lovable-uploads/5592343a-9de5-48ce-8f71-58ce73f57dd1.png" alt="Soradata" className="w-8 h-8 object-contain flex-shrink-0 mt-1" />
          <div className="flex-1 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {isProcessing ? 'Memproses file...' : 'Sedang mengetik...'}
            </span>
          </div>
        </div>
      )}
    </div>
  ), [messages, theme, isLoading, isProcessing, uploadedFile, error, handleVisualization, handleInsights, handleSummary, handleTrends]);

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex-1 overflow-y-auto p-8">{mainContent}</div>
      {/* Input area */}
      {/* ... (tetap sama seperti versi asli) */}
    </div>
  );
};
