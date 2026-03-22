'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { queryApi } from '@/api/query';
import { useSession } from './SessionContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  receiveMessage: (payload: any) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { activeSession } = useSession();

  // Load History when session changes
  useEffect(() => {
    if (activeSession) {
      const fetchHistory = async () => {
        try {
          const history = await queryApi.getHistory(activeSession.sessionId);
          const formatted = history.flatMap((h: any) => [
            { id: `q-${h.id}`, role: 'user', content: h.question, timestamp: h.timestamp },
            { id: `a-${h.id}`, role: 'assistant', content: h.response, timestamp: h.timestamp }
          ]);
          setMessages(formatted);
        } catch (e) {
          console.error("Failed to load chat history:", e);
        }
      };
      fetchHistory();
    } else {
      setMessages([{ 
        id: 'welcome', 
        role: 'assistant', 
        content: 'Welcome to KnowledgeGraphX! Join a workspace to start neural querying.',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [activeSession]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeSession) {
      alert("Please join a workspace first");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await queryApi.ask(content, activeSession.sessionId);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
       console.error("Query failed:", error);
       setMessages(prev => [...prev, {
         id: 'error',
         role: 'assistant',
         content: "I encountered an error while processing your request. Please ensure you have documents in this workspace.",
         timestamp: new Date().toISOString()
       }]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSession]);

  const receiveMessage = useCallback((payload: any) => {
    // Prevent duplicate messages if I am the one who sent them (already added locally)
    const { sender, content, type, sources } = payload;
    
    setMessages(prev => {
      // Check if message already exists by content/timestamp if needed, 
      // but for simplicity we'll check against a recently added message
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.content === content) return prev;

      const newMessage: Message = {
        id: Date.now().toString(),
        role: type.includes('AI') ? 'assistant' : 'user',
        content: content,
        sources: sources,
        timestamp: new Date().toISOString()
      };
      
      return [...prev, newMessage];
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, receiveMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
