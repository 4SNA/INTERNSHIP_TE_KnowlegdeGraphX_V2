'use client';

import * as React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Brain, X, Download, Share2, Sparkles } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string | null;
  loading: boolean;
}

export function ReportModal({ isOpen, onClose, report, loading }: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />
      
      <Card className="relative w-full max-w-4xl h-[80vh] bg-zinc-900/90 border-zinc-800/60 shadow-3xl rounded-[48px] glass overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Brain size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white tracking-tight">Intelligence Synthesis</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Neural Report v2.0</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
             <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                   <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Brain size={24} className="text-indigo-500/40" />
                   </div>
                </div>
                <div className="text-center">
                   <p className="text-sm font-black text-zinc-300 uppercase tracking-widest">Aggregating Neural Fragments</p>
                   <p className="text-xs font-bold text-zinc-600 mt-2">Synthesizing executive intelligence report...</p>
                </div>
             </div>
          ) : (
             <div className="prose prose-invert max-w-none">
                <div className="space-y-8">
                   <div className="p-10 rounded-[40px] bg-zinc-950/40 border border-white/5 shadow-2xl">
                      <MarkdownContent content={report || "No intelligence data available yet for this workspace."} />
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-zinc-950/40 flex items-center justify-between">
           <div className="flex gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <span>Security: PROT-SEC-HIGH</span>
              <span className="opacity-30">|</span>
              <span>Encryption: AES-256</span>
           </div>
           <div className="flex gap-4">
              <Button variant="ghost" className="rounded-2xl gap-2 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800">
                 <Download size={16} />
                 <span className="font-bold">Export PDF</span>
              </Button>
              <Button className="rounded-2xl gap-2 font-bold shadow-lg shadow-indigo-500/20">
                 <Share2 size={16} />
                 <span>Secure Share</span>
              </Button>
           </div>
        </div>

        <div className="absolute top-0 right-10 p-10 opacity-[0.02] pointer-events-none">
           <Sparkles size={160} />
        </div>
      </Card>
    </div>
  );
}
