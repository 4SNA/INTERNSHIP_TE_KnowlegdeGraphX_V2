"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";
import { usePopover } from "@/context/PopoverContext";

export function GlobalPopover() {
  const { activePopover, closePopover } = usePopover();

  if (!activePopover) return null;

  return (
    <div className="fixed bottom-10 right-10 w-[400px] z-[200] animate-in fade-in slide-in-from-bottom-10 duration-500">
       <div className="relative p-8 rounded-[40px] bg-zinc-900/95 border border-white/10 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-hidden ring-1 ring-white/10">
          {/* Progress/Accent Bar */}
          <div className={cn("absolute top-0 left-0 w-full h-1.5", 
            activePopover.anchor === 'terminate' ? "bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
          )} />
          
          <div className="flex gap-6 mb-8">
             <div className={cn("shrink-0 w-16 h-16 rounded-3xl flex items-center justify-center border shadow-inner", 
                activePopover.anchor === 'terminate' ? "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-950/20" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-indigo-950/20"
             )}>
                {activePopover.icon}
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-black text-white tracking-tighter leading-none decoration-white/10 decoration-2 underline underline-offset-4 decoration-dashed">{activePopover.title}</h3>
                   {activePopover.anchor === 'terminate' 
                    ? <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20 animate-pulse">Critical</span>
                    : <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">Protocol Beta</span>
                   }
                </div>
                <p className="text-sm text-zinc-400/90 font-medium leading-relaxed tracking-tight">{activePopover.description}</p>
             </div>
          </div>

          {activePopover.action ? (
             <div className="flex gap-3">
                <button 
                   onClick={closePopover}
                   className="flex-1 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all border border-white/5 active:scale-95"
                >
                   Cancel
                </button>
                <button 
                   onClick={activePopover.action}
                   className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-all ring-1 ring-rose-400/30 active:scale-95"
                >
                   Confirm Purge
                </button>
             </div>
          ) : (
             <button 
                onClick={closePopover}
                className="w-full h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-[10px] uppercase tracking-[0.3em] font-black transition-all border border-white/5 shadow-lg active:scale-[0.98]"
             >
                Acknowledge Protocol
             </button>
          )}

          {/* High-fidelity decorative elements */}
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
             <Brain size={84} />
          </div>
          <div className={cn("absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-3xl pointer-events-none",
            activePopover.anchor === 'terminate' ? "bg-rose-500/10" : "bg-indigo-500/10"
          )} />
       </div>
    </div>
  );
}
