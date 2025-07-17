
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
}

// Generate proper UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useChatHistory = () => {
  const { user } = useAuth();

  const saveChatSession = useCallback(async (session: ChatSession) => {
    if (!user || !session.id) return;

    try {
      console.log('Saving chat session:', session.id, 'with', session.messages.length, 'messages');
      
      // Update or create the session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .upsert({
          id: session.id,
          user_id: user.id,
          title: session.title,
          updated_at: new Date().toISOString()
        });

      if (sessionError) {
        console.error('Error saving chat session:', sessionError);
        return;
      }

      // Save all messages with proper UUIDs
      for (const message of session.messages) {
        // Ensure message has proper UUID
        const messageId = message.id.length === 36 ? message.id : generateUUID();
        
        console.log('Saving message:', messageId, 'content length:', message.text.length);
        
        const { error: messageError } = await supabase
          .from('chat_messages')
          .upsert({
            id: messageId,
            session_id: session.id,
            content: message.text,
            is_user: message.isUser,
            file_preview: message.filePreview || null,
            visualization_data: message.visualizationData || null,
            created_at: message.timestamp.toISOString()
          });

        if (messageError) {
          console.error('Error saving message:', messageId, messageError);
        } else {
          console.log('Successfully saved message:', messageId);
        }
      }
      
      console.log('Chat session saved successfully');
    } catch (error) {
      console.error('Error in saveChatSession:', error);
    }
  }, [user]);

  const generateChatTitle = useCallback((messages: Message[]): string => {
    const userMessages = messages.filter(m => m.isUser);
    if (userMessages.length === 0) return 'Chat Baru';

    const firstMessage = userMessages[0].text;
    
    // Check for file-related messages
    if (firstMessage.toLowerCase().includes('upload') || firstMessage.toLowerCase().includes('file')) {
      return 'Analisis Data File';
    }
    
    // Check for analysis-related keywords
    if (firstMessage.toLowerCase().includes('analisis') || firstMessage.toLowerCase().includes('analisa')) {
      return 'Analisis Data';
    }
    
    if (firstMessage.toLowerCase().includes('visualisasi') || firstMessage.toLowerCase().includes('chart')) {
      return 'Visualisasi Data';
    }
    
    // Use first few words of the first message
    const words = firstMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }, []);

  return {
    saveChatSession,
    generateChatTitle
  };
};
