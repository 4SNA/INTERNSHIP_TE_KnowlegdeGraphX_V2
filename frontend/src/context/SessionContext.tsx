'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sessionApi } from '@/api/session';

interface Session {
  sessionId: number;
  sessionCode: string;
  createdByEmail: string;
}

interface SessionContextType {
  activeSession: Session | null;
  loading: boolean;
  createSession: () => Promise<void>;
  joinSession: (code: string) => Promise<void>;
  clearSession: () => void;
  terminateActiveSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('activeSession');
    if (saved) {
      setActiveSession(JSON.parse(saved));
    }
  }, []);

  const createSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionApi.create();
      setActiveSession(data);
      localStorage.setItem('activeSession', JSON.stringify(data));
    } catch (error) {
      console.error("Session creation failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinSession = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const data = await sessionApi.join(code);
      setActiveSession(data);
      localStorage.setItem('activeSession', JSON.stringify(data));
    } catch (error) {
      console.error("Session join failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setActiveSession(null);
    localStorage.removeItem('activeSession');
  }, []);

  const terminateActiveSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await sessionApi.terminateSession(activeSession.sessionCode);
      clearSession();
    } catch (error) {
      console.error("Neural termination failed:", error);
      // Even if API fails, we might want to clear local
      clearSession();
    }
  }, [activeSession, clearSession]);

  return (
    <SessionContext.Provider value={{ activeSession, loading, createSession, joinSession, clearSession, terminateActiveSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
