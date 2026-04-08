'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { queryApi } from '@/api/query';
import { useSession } from './SessionContext';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  suggestedQueries?: string[];
  timestamp: string;
  senderEmail?: string;
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
  const { user } = useAuth();

  // Load History when session changes
  useEffect(() => {
    if (activeSession) {
      const fetchHistory = async () => {
        try {
          const history = await queryApi.getHistory(activeSession.sessionId);
          console.log("Neural History Package:", history);
          
          if (Array.isArray(history)) {
            const formatted = history.flatMap((h: any) => [
              { id: `q-${h.id}`, role: 'user' as const, content: h.question, timestamp: h.timestamp, senderEmail: h.senderEmail },
              { id: `a-${h.id}`, role: 'assistant' as const, content: h.response, timestamp: h.timestamp, suggestedQueries: h.suggestedQueries }
            ]);
            setMessages(formatted);
          } else {
             console.warn("Neural Sync: History packet format incompatible.", history);
             setMessages([]);
          }
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
    if (isLoading) return; // Prevent overlapping neural queries

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      senderEmail: user?.email
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await queryApi.ask(content, activeSession.sessionId);
      
      setMessages(prev => {
        // Clinical Deduplication: If the message (by ID) is already present via WebSocket, skip
        if (prev.some(m => m.id === data.messageId)) {
           console.log("Neural Sync: HTTP payload merged with existing Socket payload.");
           return prev;
        }
        
        const assistantMessage: Message = {
          id: data.messageId || (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          suggestedQueries: data.suggestedQueries,
          timestamp: new Date().toISOString()
        };
        return [...prev, assistantMessage];
      });
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
  }, [activeSession, isLoading]);

  const receiveMessage = useCallback((payload: any) => {
    const { sender, content, type, sources, suggestedQueries, messageId, isStreaming, isFinal } = payload;
    const mId = messageId || Date.now().toString();

    setMessages(prev => {
      // 1. Handle Real-time Streaming Chunks
      if (type === 'STREAM_CHUNK') {
        const existingMessageIndex = prev.findIndex(m => m.id === mId);
        if (existingMessageIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[existingMessageIndex] = {
            ...updatedMessages[existingMessageIndex],
            content: updatedMessages[existingMessageIndex].content + content
          };
          return updatedMessages;
        } else {
          // New streaming message start
          return [...prev, {
            id: mId,
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString()
          }];
        }
      }

      // 2. Handle Final Responses or Regular Messages
      const isAI = type.includes('AI');
      const isDuplicate = prev.some(m => m.id === mId);
      
      if (isDuplicate) {
        if (isAI && isFinal) {
          // Finalize the streaming message with metadata
          return prev.map(m => m.id === mId ? { 
            ...m, 
            content: content || m.content, 
            suggestedQueries, 
            sources 
          } : m);
        }
        return prev;
      }

      return [...prev, {
        id: mId,
        role: isAI ? 'assistant' : 'user',
        content: content,
        sources,
        suggestedQueries,
        timestamp: new Date().toISOString(),
        senderEmail: payload.senderEmail || sender 
      }];
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
