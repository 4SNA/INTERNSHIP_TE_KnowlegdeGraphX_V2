import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, MoreHorizontal, Download, Share2 } from "lucide-react";
import { Card } from "../Card";

interface DocumentCardProps {
  name: string;
  size: string;
  date: string;
}

export function DocumentCard({ name, size, date }: DocumentCardProps) {
  return (
    <Card className="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group bg-zinc-900/40 border-zinc-800/60 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-12 h-14 rounded-lg bg-zinc-950/60 border border-zinc-800 flex flex-col items-center justify-center gap-1 group-hover:border-indigo-500/20 group-hover:bg-indigo-500/5 transition-all">
          <FileText size={20} className="text-indigo-400" />
          <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1 rounded uppercase">PDF</span>
        </div>
        <button className="text-zinc-600 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div>
        <h3 className="text-sm font-bold text-zinc-100 truncate tracking-tight">{name}</h3>
        <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">{size} • {date}</p>
      </div>

      <div className="flex items-center gap-2 mt-auto border-t border-zinc-800/50 pt-3">
         <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold text-zinc-400 bg-zinc-950/40 hover:bg-zinc-800/50 hover:text-white transition-all">
            <Download size={12} />
            <span>Download</span>
         </button>
         <button className="flex items-center justify-center h-8 px-2 rounded-md bg-zinc-950/40 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20">
            <Share2 size={12} />
         </button>
      </div>
    </Card>
  );
}
