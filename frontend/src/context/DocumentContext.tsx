'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { documentApi } from '@/api/document';
import { useSession } from './SessionContext';

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  fetchDocuments: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { activeSession } = useSession();

  const fetchDocuments = useCallback(async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const docs = await documentApi.getAll(activeSession.sessionId);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = useCallback(async (file: File) => {
    if (!activeSession) {
      alert("Please join a workspace first");
      return;
    }
    setUploading(true);
    setUploadProgress(10); // Simulated start progress
    try {
      await documentApi.upload(file, activeSession.sessionId);
      setUploadProgress(100);
      await fetchDocuments();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document. Please ensure it's a PDF, DOCX or CSV.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [activeSession, fetchDocuments]);

  return (
    <DocumentContext.Provider value={{ documents, loading, uploading, uploadProgress, fetchDocuments, uploadFile }}>
      {children}
    </DocumentContext.Provider>
  );
}

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
