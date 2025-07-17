
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { ChatContent } from "@/components/content/ChatContent";
import { HistoryContent } from "@/components/content/HistoryContent";
import { SettingsContent } from "@/components/content/SettingsContent";
import { ProfileContent } from "@/components/content/ProfileContent";
import { DataContent } from "@/components/content/DataContent";
import { HeaderBar } from "@/components/content/HeaderBar";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ErrorBanner } from "@/components/content/ErrorBanner";

interface Message {
  id: string;
  text: string;
  isUser: boolean;  
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
  userId: string;
}

// Generate proper UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { saveChatSession, generateChatTitle } = useChatHistory();
  
  // Stable state hooks - always called in same order
  const [activeMenu, setActiveMenu] = useState('chat');
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize initial session creation to prevent recreating on every render
  const createNewSession = useCallback(() => {
    if (!user) return null;
    return {
      id: generateUUID(),
      title: "Chat Baru",
      messages: [],
      lastActivity: new Date(),
      userId: user.id
    };
  }, [user]);

  // Initialize chat session only once when user is available
  useEffect(() => {
    if (user && !currentChatSession) {
      const newSession = createNewSession();
      if (newSession) {
        setCurrentChatSession(newSession);
      }
    }
  }, [user, currentChatSession, createNewSession]);

  // Error handling - always called
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(`Application error: ${event.error?.message || 'Unknown error occurred'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(`Promise rejection: ${event.reason?.message || 'Unknown promise rejection'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Event listeners - always called
  useEffect(() => {
    const handleOpenProfile = () => setActiveMenu('profile');
    const handleOpenSettings = () => setActiveMenu('settings');
    const handleOpenData = () => setActiveMenu('data');

    window.addEventListener('openProfile', handleOpenProfile);
    window.addEventListener('openSettings', handleOpenSettings);
    window.addEventListener('openData', handleOpenData);
    
    return () => {
      window.removeEventListener('openProfile', handleOpenProfile);
      window.removeEventListener('openSettings', handleOpenSettings);
      window.removeEventListener('openData', handleOpenData);
    };
  }, []);

  // Sidebar toggle - always called
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
  }, []);

  // New chat handler - always called
  useEffect(() => {
    const handleNewChatCreated = (event: CustomEvent) => {
      if (event.detail?.session) {
        setCurrentChatSession(event.detail.session);
        setActiveMenu('chat');
      } else {
        const newSession = createNewSession();
        if (newSession) {
          setCurrentChatSession(newSession);
          setActiveMenu('chat');
        }
      }
    };

    window.addEventListener('newChatCreated', handleNewChatCreated as EventListener);
    return () => window.removeEventListener('newChatCreated', handleNewChatCreated as EventListener);
  }, [createNewSession]);

  // Stable callback definitions
  const handleSelectChat = useCallback((session: ChatSession) => {
    try {
      setCurrentChatSession(session);
      setActiveMenu('chat');
      setError(null);
    } catch (err: any) {
      console.error('Error selecting chat:', err);
      setError(`Error selecting chat: ${err.message}`);
    }
  }, []);

  const handleChatUpdate = useCallback(async (messages: Message[]) => {
    try {
      if (currentChatSession) {
        const updatedSession = {
          ...currentChatSession,
          messages,
          lastActivity: new Date(),
          title: messages.length > 0 ? generateChatTitle(messages) : currentChatSession.title
        };
        
        setCurrentChatSession(updatedSession);
        
        if (messages.length > 0) {
          await saveChatSession(updatedSession);
        }
        
        window.dispatchEvent(new CustomEvent('chatUpdated', {
          detail: { session: updatedSession }
        }));
        
        setError(null);
      }
    } catch (err: any) {
      console.error('Error updating chat:', err);
      setError(`Error updating chat: ${err.message}`);
    }
  }, [currentChatSession, saveChatSession, generateChatTitle]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleNewChat = useCallback(() => {
    const newSession = createNewSession();
    if (newSession) {
      setCurrentChatSession(newSession);
      setActiveMenu('chat');
    }
  }, [createNewSession]);

  // Memoize content rendering to prevent unnecessary re-renders
  const renderContent = useMemo(() => {
    try {
      switch (activeMenu) {
        case 'chat':
          return (
            <ChatContent 
              chatHistory={currentChatSession?.messages}
              onChatUpdate={handleChatUpdate}
              threadId={currentChatSession?.id}
              sidebarCollapsed={sidebarCollapsed}
            />
          );
        case 'history':
          return (
            <HistoryContent 
              onSelectChat={handleSelectChat}
              activeSessionId={currentChatSession?.id}
            />
          );
        case 'data':
          return <DataContent />;
        case 'settings':
          return <SettingsContent />;
        case 'profile':
          return <ProfileContent />;
        default:
          return (
            <ChatContent 
              chatHistory={currentChatSession?.messages}
              onChatUpdate={handleChatUpdate}
              threadId={currentChatSession?.id}
              sidebarCollapsed={sidebarCollapsed}
            />
          );
      }
    } catch (err: any) {
      console.error('Error rendering content:', err);
      setError(`Error rendering content: ${err.message}`);
      return <div className="p-6 text-center text-red-500">Error loading content. Please refresh the page.</div>;
    }
  }, [activeMenu, currentChatSession, handleChatUpdate, handleSelectChat, sidebarCollapsed]);

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-gray-900">
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <ErrorBanner 
            message={error} 
            onClose={() => setError(null)}
          />
        </div>
      )}
      
      <HeaderBar 
        onProfile={() => setActiveMenu('profile')}
        onSettings={() => setActiveMenu('settings')}
        onData={() => setActiveMenu('data')}
        onToggleSidebar={handleToggleSidebar}
        conversationTitle={currentChatSession?.title || "Mau analisa data apa hari ini?"}
        onNewChat={handleNewChat}
      />
      
      <div className={`transition-all duration-200 ease-out ${sidebarCollapsed ? 'w-0' : 'w-80'} flex-shrink-0 fixed left-0 top-16 h-[calc(100vh-4rem)] z-40`}>
        <AppSidebar 
          activeMenu={activeMenu} 
          onMenuChange={setActiveMenu}
          onSidebarToggle={setSidebarCollapsed}
          collapsed={sidebarCollapsed}
          onSelectChat={handleSelectChat}
        />
      </div>
      
      <div className={`flex-1 transition-all duration-200 ease-out ${sidebarCollapsed ? 'ml-0' : 'ml-80'} pt-16 bg-white dark:bg-gray-900 w-full ${error ? 'pt-24' : 'pt-16'}`}>
        <div className="w-full h-[calc(100vh-4rem)]">
          {renderContent}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
