
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Database, Trash2, Pin, PinOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  lastActivity: Date;
  userId: string;
  pinned?: boolean;
}

interface AppSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onSidebarToggle?: (collapsed: boolean) => void;
  collapsed?: boolean;
  onSelectChat?: (session: ChatSession) => void;
}

export const AppSidebar = ({
  activeMenu,
  onMenuChange,
  onSidebarToggle,
  collapsed = false,
  onSelectChat
}: AppSidebarProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    if (onSidebarToggle) {
      onSidebarToggle(newCollapsed);
    }
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newCollapsed }
    }));
  };

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'Percakapan Baru'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new chat session:', error);
        return;
      }

      const newChatSession: ChatSession = {
        id: newSession.id,
        title: newSession.title,
        messages: [],
        lastActivity: new Date(newSession.created_at),
        userId: newSession.user_id,
        pinned: false
      };

      setChatHistory(prev => sortChatSessions([newChatSession, ...prev]));
      onMenuChange('chat');
      
      if (onSelectChat) {
        onSelectChat(newChatSession);
      }

      window.dispatchEvent(new CustomEvent('newChatCreated', {
        detail: { session: newChatSession }
      }));
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleDeleteChat = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
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
      setChatHistory(prev => prev.filter(session => session.id !== sessionId));
      
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

  const handlePinChat = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) return;

    try {
      const session = chatHistory.find(s => s.id === sessionId);
      const newPinnedState = !session?.pinned;

      // Check if trying to pin and already have 3 pinned chats
      if (newPinnedState) {
        const pinnedCount = chatHistory.filter(s => s.pinned).length;
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
      setChatHistory(prev => {
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

  // Load chat history
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      if (!user) return;
      
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      const formattedSessions: ChatSession[] = sessions?.map(session => ({
        id: session.id,
        title: session.title,
        messages: session.chat_messages || [],
        lastActivity: new Date(session.updated_at),
        userId: session.user_id,
        pinned: session.pinned || false
      })) || [];

      // Sort sessions properly (pinned first, then by activity)
      setChatHistory(sortChatSessions(formattedSessions));
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Listen for chat updates
  useEffect(() => {
    const handleChatUpdate = (event: CustomEvent) => {
      const { session } = event.detail;
      setChatHistory(prev => {
        const existingIndex = prev.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { 
            ...session, 
            pinned: updated[existingIndex].pinned || false 
          };
          return sortChatSessions(updated);
        } else {
          return sortChatSessions([{ ...session, pinned: false }, ...prev]);
        }
      });
    };

    window.addEventListener('chatUpdated', handleChatUpdate as EventListener);
    return () => window.removeEventListener('chatUpdated', handleChatUpdate as EventListener);
  }, []);

  if (collapsed) {
    return null;
  }

  return (
    <div className={`w-80 h-screen border-r flex flex-col transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
      {/* Navigation Menu */}
      <div className="p-6 space-y-3">
        <Button 
          onClick={handleNewChat} 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Chat baru
        </Button>

        <Button 
          variant={activeMenu === 'data' ? 'default' : 'ghost'} 
          onClick={() => onMenuChange('data')} 
          className={`w-full justify-start text-left p-4 h-auto rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 ${
            activeMenu === 'data' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : theme === 'dark' 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="font-medium">Data Tersimpan</span>
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-2">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Belum ada riwayat chat
              </p>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Mulai chat baru untuk menyimpan percakapan
              </p>
            </div>
          ) : (
            <>
              {/* Show pinned chats count if any */}
              {chatHistory.filter(chat => chat.pinned).length > 0 && (
                <div className={`text-xs font-medium mb-2 px-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  📌 Disematkan ({chatHistory.filter(chat => chat.pinned).length}/3)
                </div>
              )}
              
              {chatHistory.slice(0, 20).map(chat => (
                <div key={chat.id} className="group relative">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start text-left p-4 h-auto rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      chat.pinned 
                        ? theme === 'dark' 
                          ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-900/30' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`} 
                    onClick={() => {
                      onMenuChange('chat');
                      if (onSelectChat) {
                        onSelectChat(chat);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center gap-2">
                        {chat.pinned && (
                          <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="font-medium text-sm truncate">
                          {chat.title}
                        </div>
                      </div>
                      <div className={`text-xs mt-1 ${
                        chat.pinned 
                          ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {chat.lastActivity.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </Button>
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => handlePinChat(chat.id, e)}
                      className={`p-2 ${
                        chat.pinned 
                          ? theme === 'dark' 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                          : theme === 'dark' 
                            ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/20' 
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={chat.pinned ? "Lepas sematan" : "Sematkan chat"}
                    >
                      {chat.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className={`p-2 ${theme === 'dark' ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      title="Hapus chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Bottom Section - User Info */}
      <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="text-center">
          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Soradata Chat
          </div>
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {user?.email}
          </div>
        </div>
      </div>
    </div>
  );
};
