import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "../Card";

interface QueryCardProps {
  query: string;
  response: string;
  timestamp: string;
}

export function QueryCard({ query, response, timestamp }: QueryCardProps) {
  return (
    <Card className="hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group bg-zinc-900/40 border-zinc-800/60 p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all text-indigo-400 rotate-12 -translate-y-4 translate-x-4">
        <Sparkles size={80} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <MessageSquare size={14} className="text-indigo-400" />
           <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Recent Query</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-medium">
           <Clock size={12} />
           <span>{timestamp}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
           <p className="text-[13px] font-bold text-zinc-100 line-clamp-1 italic tracking-tight">{query}</p>
        </div>
        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60 group-hover:border-indigo-500/20 group-hover:bg-indigo-500/5 transition-all">
           <p className="text-[12px] text-zinc-400 font-medium leading-relaxed line-clamp-2">{response}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
         <div className="flex items-center gap-1.5 bg-zinc-800/40 px-2 py-1 rounded-md">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-zinc-500">Verified Answer</span>
         </div>
         <div className="flex-1" />
         <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            View Details
         </button>
      </div>
    </Card>
  );
}
