import * as React from "react";
import { cn } from "@/lib/utils";
import { Users, ArrowUpRight } from "lucide-react";
import { Card } from "../Card";

interface SessionCardProps {
  code: string;
  usersCount: number;
}

export function SessionCard({ code, usersCount }: SessionCardProps) {
  return (
    <Card className="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group bg-zinc-900/40 border-zinc-800/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-200 tracking-tight">{code}</h3>
            <p className="text-[10px] text-zinc-500 font-medium">Session Code</p>
          </div>
        </div>
        <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
             <div key={i} className="w-6 h-6 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                {String.fromCharCode(64 + i)}
             </div>
          ))}
          <div className="w-6 h-6 rounded-full border border-zinc-900 bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
            +{usersCount - 3}
          </div>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium">{usersCount} users active</span>
      </div>
    </Card>
  );
}
