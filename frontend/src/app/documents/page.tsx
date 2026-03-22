'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { FileUpload } from '@/components/FileUpload';
import { useDocuments } from '@/context/DocumentContext';
import { FileText, Trash2, ExternalLink, HardDrive, Clock, BarChart2 } from 'lucide-react';
import { Card } from '@/components/Card';

export default function DocumentsPage() {
  const { documents, loading } = useDocuments();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-[#050510] font-sans selection:bg-indigo-500/30">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative no-scrollbar">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] -z-10 rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] -z-10 rounded-full" />

            <div className="max-w-6xl mx-auto space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                   <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <HardDrive size={20} />
                   </div>
                   <span className="text-[10px] uppercase font-extrabold tracking-widest">Workspace Storage</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Neural <span className="text-indigo-400">Knowledge</span> Base</h1>
                <p className="text-zinc-500 text-sm font-medium tracking-tight">Manage and curate documents that power your collective AI insights.</p>
              </header>

              <FileUpload />

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-6 uppercase font-extrabold text-[10px] text-zinc-500 tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Library Repository</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-indigo-400/60">{documents.length} Entities Indexed</span>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-40 rounded-[32px] bg-zinc-900/40 border border-zinc-800/60" />
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-20 text-center rounded-[40px] bg-zinc-900/20 border border-dashed border-zinc-800/40">
                     <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-700 mx-auto mb-6">
                        <BarChart2 size={32} />
                     </div>
                     <h2 className="text-xl font-bold text-zinc-400 mb-2">Workspace Library is Empty</h2>
                     <p className="text-zinc-600 text-sm font-medium">Upload your first document to begin building the neural graph.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="group p-6 rounded-[32px] bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/60 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden backdrop-blur-xl">
                        <div className="flex items-start justify-between mb-8">
                           <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-indigo-400 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                              <FileText size={20} />
                           </div>
                           <div className="flex items-center gap-2">
                              <button className="p-2 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-900 transition-colors">
                                 <ExternalLink size={14} />
                              </button>
                           </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-extrabold text-zinc-100 truncate pr-4">{doc.fileName}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                               <HardDrive size={10} /> {formatSize(doc.fileSize)}
                            </span>
                            <span className="flex items-center gap-1">
                               <Clock size={10} /> Feb 2026
                            </span>
                          </div>
                        </div>

                        {/* Hover Overlay Accent */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
