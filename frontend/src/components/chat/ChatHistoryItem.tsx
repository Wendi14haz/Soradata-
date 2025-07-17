
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistoryItemProps {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
  onClick: () => void;
  isActive?: boolean;
}

export const ChatHistoryItem = ({ 
  id, 
  title, 
  messages, 
  lastActivity, 
  onClick, 
  isActive = false 
}: ChatHistoryItemProps) => {
  const getPreviewText = () => {
    const lastUserMessage = messages.filter(m => m.isUser).pop();
    return lastUserMessage?.text.slice(0, 60) + (lastUserMessage?.text.length > 60 ? '...' : '') || 'Sesi chat baru';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:bg-gray-700 border-gray-600 ${
        isActive ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MessageSquare className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium truncate ${isActive ? 'text-blue-300' : 'text-white'}`}>
              {title}
            </h4>
            
            <p className="text-sm text-gray-400 truncate mt-1">
              {getPreviewText()}
            </p>
            
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {lastActivity.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
