"use client";

import * as React from "react";
import { X, Sparkles, Brain, FileUp, Database, ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { FileUpload } from "./FileUpload";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

interface NewInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInsightModal({ isOpen, onClose }: NewInsightModalProps) {
  const { activeSession, createSession, loading: sessionLoading } = useSession();
  const [step, setStep] = React.useState<"initial" | "upload">(activeSession ? "upload" : "initial");

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (activeSession) {
      setStep("upload");
    } else {
      setStep("initial");
    }
  }, [activeSession]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-500 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-[0_0_150px_rgba(99,102,241,0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col mx-auto my-auto">
        {/* Header Decor */}
        <div className="shrink-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-8">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Brain size={24} />
               </div>
               <h2 className="text-2xl font-extrabold tracking-tight">Generate <span className="text-indigo-400">Neural Insight</span></h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {step === "initial" ? (
            <div className="space-y-8 py-4 text-center">
               <div className="relative mx-auto w-24 h-24 bg-zinc-950 rounded-[32px] flex items-center justify-center border border-zinc-800 shadow-xl overflow-hidden group">
                  <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                  <Database size={40} className="text-zinc-700 group-hover:text-indigo-400 transition-colors" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-zinc-100">Initialize a Knowledge Workspace</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                    To generate insights, you first need to establish a neural workspace where your data will be synchronized.
                  </p>
               </div>
               <Button 
                onClick={createSession}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold gap-3 shadow-lg shadow-indigo-500/20"
                disabled={sessionLoading}
               >
                  <span>{sessionLoading ? "Generating Workspace..." : "Create New Workspace"}</span>
                  <ArrowRight size={18} />
               </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-3 p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Workspace Active: #{activeSession?.sessionCode}</span>
               </div>
               
               <FileUpload />
               
               <div className="pt-4 flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-x-6 gap-y-3 flex-wrap justify-center opacity-60">
                     <div className="flex items-center gap-2 text-xs font-bold text-zinc-500"><FileUp size={14}/> PDF Extraction</div>
                     <div className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Sparkles size={14}/> Auto-Embedding</div>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.2em] max-w-xs">
                    Once uploaded, our neural engine will index and generate the initial knowledge graph.
                  </p>
                  <div className="pt-8 opacity-40 hover:opacity-100 transition-opacity">
                     <p className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-[0.3em]">
                        [ Press <span className="text-indigo-400">ESC</span> to Close Interface ]
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
