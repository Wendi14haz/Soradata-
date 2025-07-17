import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { History, Plus, MessageSquare, Calendar, FileText, BarChart3, Trash2, Pin, PinOff } from 'lucide-react';
import { ChatHistoryItem } from '@/components/chat/ChatHistoryItem';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  filePreview?: {
    data: any[];
    fileName: string;
  };
  visualizationData?: {
    data: any[];
    fileName: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
  userId: string;
  pinned?: boolean;
}

interface HistoryContentProps {
  onSelectChat: (session: ChatSession) => void;
  activeSessionId?: string;
}

export const HistoryContent = ({
  onSelectChat,
  activeSessionId
}: HistoryContentProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  // Function to sort chat sessions: pinned first, then by last activity
  const sortChatSessions = (sessions: ChatSession[]): ChatSession[] => {
    return sessions.sort((a, b) => {
      // Pinned chats always come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Within same pin status, sort by last activity (newest first)
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
  };

  const loadChatSessions = async () => {
    try {
      if (!user) return;

      console.log('Loading chat sessions for user:', user.id);

      // Load chat sessions from database
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (sessionsError) {
        console.error('Error loading chat sessions:', sessionsError);
        return;
      }

      console.log('Found', sessions?.length || 0, 'chat sessions');

      if (!sessions || sessions.length === 0) {
        setChatSessions([]);
        setLoading(false);
        return;
      }

      // Load messages for each session
      const sessionsWithMessages: ChatSession[] = [];
      
      for (const session of sessions) {
        console.log('Loading messages for session:', session.id);
        
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages for session', session.id, messagesError);
          continue;
        }

        console.log('Found', messages?.length || 0, 'messages for session', session.id);

        const formattedMessages: Message[] = messages?.map(msg => {
          console.log('Processing message:', msg.id, 'content length:', msg.content?.length || 0);
          
          // Safe type checking for filePreview
          let filePreview: { data: any[]; fileName: string } | undefined = undefined;
          if (msg.file_preview && typeof msg.file_preview === 'object' && 
              !Array.isArray(msg.file_preview) && 
              'data' in msg.file_preview && 'fileName' in msg.file_preview) {
            filePreview = msg.file_preview as { data: any[]; fileName: string };
          }

          // Safe type checking for visualizationData
          let visualizationData: { data: any[]; fileName: string } | undefined = undefined;
          if (msg.visualization_data && typeof msg.visualization_data === 'object' && 
              !Array.isArray(msg.visualization_data) && 
              'data' in msg.visualization_data && 'fileName' in msg.visualization_data) {
            visualizationData = msg.visualization_data as { data: any[]; fileName: string };
          }
          
          return {
            id: msg.id,
            text: msg.content || '',
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at),
            filePreview,
            visualizationData
          };
        }) || [];

        sessionsWithMessages.push({
          id: session.id,
          title: session.title,
          messages: formattedMessages,
          lastActivity: new Date(session.updated_at),
          userId: session.user_id,
          pinned: session.pinned || false
        });

        console.log('Session', session.id, 'has', formattedMessages.length, 'formatted messages');
      }

      console.log('Total sessions with messages:', sessionsWithMessages.length);
      // Sort sessions properly (pinned first, then by activity)
      setChatSessions(sortChatSessions(sessionsWithMessages));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!user) return;

    try {
      console.log('Creating new chat session for user:', user.id);
      
      // Create new session in database
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'Chat Baru'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new chat session:', error);
        return;
      }

      console.log('New chat session created:', newSession.id);

      const newChatSession: ChatSession = {
        id: newSession.id,
        title: newSession.title,
        messages: [],
        lastActivity: new Date(newSession.created_at),
        userId: newSession.user_id,
        pinned: false
      };

      setChatSessions(prev => sortChatSessions([newChatSession, ...prev]));
      onSelectChat(newChatSession);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handlePinChat = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) return;

    try {
      const session = chatSessions.find(s => s.id === sessionId);
      const newPinnedState = !session?.pinned;

      // Check if trying to pin and already have 3 pinned chats
      if (newPinnedState) {
        const pinnedCount = chatSessions.filter(s => s.pinned).length;
        if (pinnedCount >= 3) {
          toast({
            title: "📌 Batas Maksimal",
            description: "Maksimal 3 chat yang bisa disematkan",
            variant: "destructive",
          });
          return;
        }
      }

      // Update in database
      const { error } = await supabase
        .from('chat_sessions')
        .update({ pinned: newPinnedState })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating pin status:', error);
        toast({
          title: "Error",
          description: "Gagal mengubah status pin",
          variant: "destructive",
        });
        return;
      }

      // Update local state with proper sorting
      setChatSessions(prev => {
        const updated = prev.map(session => 
          session.id === sessionId 
            ? { ...session, pinned: newPinnedState }
            : session
        );
        return sortChatSessions(updated);
      });

      toast({
        title: newPinnedState ? "📌 Chat Disematkan" : "📌 Pin Dihapus",
        description: newPinnedState ? "Chat berhasil disematkan di atas" : "Chat tidak lagi disematkan",
      });

    } catch (error) {
      console.error('Error pinning chat:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengubah pin",
        variant: "destructive",
      });
    }
  };

  const deleteChatSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering onSelectChat
    
    if (!user) return;

    try {
      console.log('Deleting chat session:', sessionId);
      
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return;
      }

      // Delete session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        return;
      }

      // Update local state
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "🗑️ Chat Dihapus",
        description: "Riwayat chat berhasil dihapus",
      });
      
      console.log('Chat session deleted successfully');
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus chat",
        variant: "destructive",
      });
    }
  };

  const handleSelectChat = (session: ChatSession) => {
    // Move selected chat to appropriate position based on pin status
    setChatSessions(prev => {
      const filteredSessions = prev.filter(s => s.id !== session.id);
      const updatedSessions = [session, ...filteredSessions];
      return sortChatSessions(updatedSessions);
    });
    
    // Call the original onSelectChat
    onSelectChat(session);
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastUserMessage = session.messages.filter(m => m.isUser).pop();
    if (!lastUserMessage) return 'Belum ada pesan';
    
    const hasFile = session.messages.some(m => m.filePreview);
    const hasVisualization = session.messages.some(m => m.visualizationData);
    
    let preview = lastUserMessage.text.slice(0, 60);
    if (lastUserMessage.text.length > 60) preview += '...';
    
    if (hasFile) preview = '📊 ' + preview;
    if (hasVisualization) preview = '📈 ' + preview;
    
    return preview;
  };

  const getSessionStats = (session: ChatSession) => {
    const messageCount = session.messages.length;
    const fileCount = session.messages.filter(m => m.filePreview).length;
    const visualizationCount = session.messages.filter(m => m.visualizationData).length;
    
    return { messageCount, fileCount, visualizationCount };
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className={`border-b p-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <History className="h-6 w-6 text-blue-500" />
            Riwayat Chat SoraData
          </h2>
          <Button 
            onClick={createNewChat} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
            size="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            Chat Baru
          </Button>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {chatSessions.length > 0 
            ? `${chatSessions.length} sesi chat tersimpan. Klik untuk melanjutkan percakapan.`
            : 'Belum ada riwayat chat. Mulai chat baru untuk menyimpan percakapan Anda.'
          }
          {chatSessions.filter(s => s.pinned).length > 0 && (
            <span className="ml-2 text-blue-500">
              📌 {chatSessions.filter(s => s.pinned).length} chat disematkan
            </span>
          )}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {chatSessions.length === 0 ? (
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-w-md`}>
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <History className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Belum Ada Riwayat Chat
              </h3>
              <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Mulai percakapan dengan SoraData AI untuk menganalisis data, upload file, atau diskusi bisnis. 
                Semua chat akan tersimpan di sini.
              </p>
              <Button 
                onClick={createNewChat} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Mulai Chat Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chatSessions.map(session => {
              const stats = getSessionStats(session);
              const isActive = activeSessionId === session.id;
              
              return (
                <Card 
                  key={session.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg relative group ${
                    isActive 
                      ? `${theme === 'dark' ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-300'} ring-2 ring-blue-500/20`
                      : session.pinned
                        ? `${theme === 'dark' ? 'bg-blue-900/10 border-blue-700' : 'bg-blue-25 border-blue-200'}`
                        : `${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`
                  }`}
                  onClick={() => handleSelectChat(session)}
                >
                  {/* Action buttons - positioned at top right */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handlePinChat(session.id, e)}
                      className={`p-2 h-8 w-8 ${
                        session.pinned 
                          ? theme === 'dark' 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                          : theme === 'dark' 
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/20' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={session.pinned ? "Lepas sematan" : "Sematkan chat"}
                    >
                      {session.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => deleteChatSession(session.id, e)}
                      className={`p-2 h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      title="Hapus chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardContent className="p-6 pr-20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {session.pinned && (
                            <Pin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                          <MessageSquare className={`w-5 h-5 flex-shrink-0 ${
                            isActive 
                              ? 'text-blue-500' 
                              : session.pinned
                                ? 'text-blue-400'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <h4 className={`font-semibold truncate ${
                            isActive 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : session.pinned
                                ? 'text-blue-600 dark:text-blue-300'
                                : theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {session.title}
                          </h4>
                        </div>
                        
                        <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getSessionPreview(session)}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {session.lastActivity.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            <MessageSquare className="w-3 h-3" />
                            <span>{stats.messageCount} pesan</span>
                          </div>
                          
                          {stats.fileCount > 0 && (
                            <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                              <FileText className="w-3 h-3" />
                              <span>{stats.fileCount} file</span>
                            </div>
                          )}
                          
                          {stats.visualizationCount > 0 && (
                            <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                              <BarChart3 className="w-3 h-3" />
                              <span>{stats.visualizationCount} chart</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center gap-2">
                        {isActive && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
