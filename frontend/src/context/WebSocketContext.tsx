'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { useSession } from './SessionContext';
import { useChat } from './ChatContext';

interface WebSocketContextType {
  connected: boolean;
  activeUsers: string[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const stompClient = useRef<Client | null>(null);
  const { user } = useAuth();
  const { activeSession } = useSession();
  const { messages, sendMessage } = useChat(); // Note: We might need to append directly

  const connect = useCallback(() => {
    if (stompClient.current?.active || !activeSession || !user) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      setConnected(true);
      console.log('Connected to STOMP');

      // Subscribe to session-specific topic
      client.subscribe(`/topic/session/${activeSession.sessionId}`, (message) => {
        const payload = JSON.parse(message.body);
        handleIncomingMessage(payload);
      });

      // Broadcast "JOIN" event
      client.publish({
        destination: `/app/chat.addUser/${activeSession.sessionId}`,
        body: JSON.stringify({
          sender: user.name,
          type: 'JOIN',
          sessionId: activeSession.sessionId
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onDisconnect = () => {
      setConnected(false);
      console.log('Disconnected from STOMP');
    };

    client.activate();
    stompClient.current = client;
  }, [activeSession, user]);

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setConnected(false);
    }
  }, []);

  const { receiveMessage } = useChat();

  const handleIncomingMessage = (payload: any) => {
    console.log("Real-time payload received:", payload);
    const { type, sender } = payload;
    
    if (type === 'JOIN' || type === 'USER_JOINED') {
      setActiveUsers(prev => {
        if (!prev.includes(sender)) return [...prev, sender];
        return prev;
      });
    } else if (type === 'LEAVE' || type === 'USER_LEFT') {
      setActiveUsers(prev => prev.filter(u => u !== sender));
    } else {
      receiveMessage(payload);
    }
  };

  useEffect(() => {
    if (activeSession && user) {
      connect();
    }
    return () => disconnect();
  }, [activeSession, user, connect, disconnect]);

  return (
    <WebSocketContext.Provider value={{ connected, activeUsers }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
