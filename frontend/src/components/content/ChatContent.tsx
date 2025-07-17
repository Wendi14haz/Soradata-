
import { ChatInterface } from '@/components/chat/ChatInterface';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatContentProps {
  chatHistory?: Message[];
  onChatUpdate?: (messages: Message[]) => void;
  threadId?: string;
  sidebarCollapsed?: boolean;
}

export const ChatContent = ({ 
  chatHistory, 
  onChatUpdate, 
  threadId,
  sidebarCollapsed = false
}: ChatContentProps) => {
  return (
    <ChatInterface 
      chatHistory={chatHistory}
      onChatUpdate={onChatUpdate}
      threadId={threadId}
      sidebarCollapsed={sidebarCollapsed}
    />
  );
};
