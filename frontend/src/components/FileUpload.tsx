'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocuments } from '@/context/DocumentContext';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFile, uploading, uploadProgress } = useDocuments();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden",
          isDragging 
            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]" 
            : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/60",
          uploading && "pointer-events-none opacity-80"
        )}
      >
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={onFileChange}
          accept=".pdf,.docx,.csv"
        />

        <div className="p-12 flex flex-col items-center text-center space-y-6">
          <div className={cn(
            "w-20 h-20 rounded-2xl bg-zinc-950 flex items-center justify-center transition-all duration-700 shadow-2xl",
            isDragging ? "scale-110 rotate-3 text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400 group-hover:-translate-y-1"
          )}>
            {uploading ? (
               <div className="relative">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                  <File size={32} className="text-indigo-400" />
               </div>
            ) : (
               <Upload size={32} />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center justify-center gap-2">
              {uploading ? "Analyzing & Embedding..." : "Upload Knowledge Source"}
              {!uploading && <Sparkles size={16} className="text-indigo-400 animate-pulse" />}
            </h3>
            <p className="text-sm font-medium text-zinc-500 max-w-[280px]">
              {uploading 
                ? "Feeding your project library to the neural search engine"
                : "Drag & drop your PDF, DOCX or CSV files here to build your workspace knowledge."}
            </p>
          </div>

          {!uploading && (
             <div className="flex items-center gap-4 pt-2">
                <span className="px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider">PDF Ready</span>
                <span className="px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider">Max 10MB</span>
             </div>
          )}

          {uploading && (
            <div className="w-full max-w-[240px] pt-4">
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,1)]" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-3 text-[10px] font-extrabold text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                {uploadProgress}% Indexed
              </p>
            </div>
          )}
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl -z-10" />
      </div>
    </div>
  );
}
