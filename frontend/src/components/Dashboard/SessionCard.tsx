import * as React from "react";
import { cn } from "@/lib/utils";
import { Users, ArrowUpRight, Sparkles } from "lucide-react";
import { Card } from "../Card";

interface SessionCardProps {
  code: string;
  usersCount: number;
  active?: boolean;
}

export function SessionCard({ code, usersCount, active = false }: SessionCardProps) {
  return (
    <Card className={cn(
      "hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group p-6 rounded-[32px] relative overflow-hidden",
      active 
        ? "bg-indigo-500/10 border-indigo-500/30 shadow-2xl shadow-indigo-500/10" 
        : "bg-zinc-900/40 border-zinc-800/60"
    )}>
      {active && (
        <div className="absolute top-4 right-4 text-indigo-400 animate-pulse">
           <Sparkles size={16} />
        </div>
      )}

      <div className="flex flex-col h-full justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            active ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" : "bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-indigo-400 group-hover:bg-zinc-900"
          )}>
            <Users size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-extrabold tracking-tight truncate",
              active ? "text-indigo-100" : "text-zinc-200"
            )}>{code}</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{active ? "Active Workspace" : "Previous Session"}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2">
                  {[1, 2].map((i) => (
                     <div key={i} className="w-7 h-7 rounded-lg border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                        {String.fromCharCode(64 + i)}
                     </div>
                  ))}
                  <div className="w-7 h-7 rounded-lg border border-zinc-900 bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                    +{usersCount}
                  </div>
               </div>
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">{usersCount > 0 ? `${usersCount} Active` : 'Synced'}</span>
            </div>
            <div className={cn(
               "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
               active ? "border-indigo-500/30 text-indigo-400" : "border-zinc-800 text-zinc-700 group-hover:text-zinc-400"
            )}>
               <ArrowUpRight size={14} />
            </div>
        </div>
      </div>
    </Card>
  );
}
