import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useFileProcessing } from '@/hooks/useFileProcessing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Upload } from 'lucide-react';
import { ChatActionButtons } from './ChatActionButtons';
import { DataVisualizationCard } from '@/components/visualization/DataVisualizationCard';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  fileData?: any;
  showActions?: boolean;
  visualizationRequest?: boolean;
  insightRequest?: boolean;
}

interface EnhancedChatInterfaceProps {
  chatHistory?: Message[];
  onChatUpdate?: (messages: Message[]) => void;
  threadId?: string;
  sidebarCollapsed?: boolean;
}

export const EnhancedChatInterface = ({
  chatHistory = [],
  onChatUpdate,
  threadId,
  sidebarCollapsed = false
}: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { processAndSaveFile, isProcessing } = useFileProcessing();
  const [messages, setMessages] = useState<Message[]>(chatHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const processedFile = await processAndSaveFile(file);
    if (processedFile) {
      setUploadedFile(processedFile);

      const fileMessage: Message = {
        id: Date.now().toString(),
        text: `📁 File "${file.name}" berhasil diupload dan diproses!\n\n✅ ${processedFile.metadata.rowCount} baris data\n📊 ${processedFile.metadata.columnCount} kolom\n📈 Siap untuk dianalisis`,
        isUser: false,
        timestamp: new Date(),
        fileData: processedFile,
        showActions: true
      };

      const updatedMessages = [...messages, fileMessage];
      setMessages(updatedMessages);
      onChatUpdate?.(updatedMessages);
    }
  };

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputMessage.trim();
    if (!messageText || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: messageText,
          history: messages.slice(-10),
          fileData: uploadedFile
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Maaf, terjadi kesalahan dalam memproses permintaan Anda.',
        isUser: false,
        timestamp: new Date(),
        showActions: uploadedFile && messageText.toLowerCase().includes('analisis')
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      onChatUpdate?.(finalMessages);

    } catch (error: any) {
      toast.error('❌ Gagal mengirim pesan', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualization = () => {
    if (!uploadedFile) return;

    const vizMessage: Message = {
      id: Date.now().toString(),
      text: `📊 Membuat visualisasi untuk data "${uploadedFile.fileName}"...`,
      isUser: false,
      timestamp: new Date(),
      visualizationRequest: true,
      fileData: uploadedFile
    };

    const updatedMessages = [...messages, vizMessage];
    setMessages(updatedMessages);
    onChatUpdate?.(updatedMessages);
  };

  const handleInsights = () => {
    sendMessage(`💡 Temukan insight bisnis dan rekomendasi strategis dari data "${uploadedFile?.fileName}".`);
  };

  const handleSummary = () => {
    sendMessage(`📝 Buatkan ringkasan eksekutif dari data "${uploadedFile?.fileName}".`);
  };

  const handleTrends = () => {
    sendMessage(`📈 Analisis tren dan pola dalam data "${uploadedFile?.fileName}".`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-[80%] ${
                  message.isUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <CardContent className="p-3">
                    <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {message.showActions && uploadedFile && (
                <ChatActionButtons
                  onVisualize={handleVisualization}
                  onInsights={handleInsights}
                  onSummary={handleSummary}
                  onTrends={handleTrends}
                  onLike={() => toast.success('👍 Anda menyukai pesan ini')}
                  onDislike={() => toast('👎 Anda tidak menyukai pesan ini')}
                  onCopy={() => {
                    navigator.clipboard.writeText(message.text);
                    toast.success('✅ Teks disalin ke clipboard');
                  }}
                  onDownload={() => {
                    const blob = new Blob([message.text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chat-${message.id}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('✅ File TXT diunduh');
                  }}
                />
              )}

              {message.visualizationRequest && message.fileData && (
                <DataVisualizationCard
                  data={message.fileData.processedData}
                  fileName={message.fileData.fileName}
                />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-gray-100 dark:bg-gray-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">SoraData AI sedang berpikir...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2 mb-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls,.json,.txt"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            disabled={isProcessing}
            className="flex-shrink-0"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Upload File'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanya tentang data Anda atau minta analisis..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
