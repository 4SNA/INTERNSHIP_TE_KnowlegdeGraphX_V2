import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Search, MoreVertical, PlusCircle, CheckCircle, Loader2 } from "lucide-react";
import { useDocuments } from "@/context/DocumentContext";
import { useSession } from "@/context/SessionContext";

interface DocumentItemProps {
  name: string;
  citedTotal?: number;
  active?: boolean;
}

function DocumentItem({ name, citedTotal, active }: DocumentItemProps) {
  return (
    <div className={cn(
      "w-full h-12 px-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group mb-1",
      active 
        ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" 
        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
    )}>
      <div className={cn(
        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-600 group-hover:text-zinc-400"
      )}>
        <FileText size={16} />
      </div>
      <span className="text-xs font-bold truncate flex-1">{name}</span>
      {citedTotal && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[8px] font-extrabold uppercase tracking-tighter text-zinc-500 group-hover:text-amber-400 group-hover:border-amber-500/20 transition-all">
           <span className="text-amber-500 underline decoration-amber-500/40">{citedTotal} citations</span>
        </div>
      )}
      {active && <CheckCircle size={12} className="text-indigo-500 ml-1" />}
      {!active && <MoreVertical size={12} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />}
    </div>
  );
}

export function DocumentExplorer() {
  const { documents, loading, uploadFile } = useDocuments();
  const { activeSession } = useSession();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSession) {
      await uploadFile(file);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="space-y-4 px-1">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Workspace Corpus</h3>
           <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600 hover:text-indigo-400 cursor-pointer transition-colors">
              <PlusCircle size={14} />
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileChange}
             accept=".pdf,.csv,.docx,.txt"
           />
        </div>
        
        <div className="relative group">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
              <Search size={14} />
           </div>
           <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full h-9 bg-zinc-900/60 border border-zinc-900 rounded-xl pl-9 pr-4 text-[10px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700" 
           />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
         {loading && (
           <div className="flex items-center justify-center py-10 text-zinc-600 gap-2">
             <Loader2 size={16} className="animate-spin" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Indexing...</span>
           </div>
         )}
         
         {!loading && documents.length === 0 && (
           <div className="text-center py-10 px-4">
             <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">No sources indexed</p>
           </div>
         )}

         {!loading && documents.map(doc => (
           <DocumentItem key={doc.id} name={doc.fileName} />
         ))}
      </div>
      
      <div className="mt-auto border-t border-zinc-900 pt-4 px-2">
         <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/5 p-4 rounded-3xl border border-indigo-500/20">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Space quota</h4>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
               <div className="h-full w-1/4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
            <p className="text-[9px] text-zinc-600 mt-2 font-medium">Free Tier Active</p>
         </div>
      </div>
    </div>
  );
}
