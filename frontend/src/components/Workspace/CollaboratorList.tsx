import * as React from "react";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Sparkles } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAuth } from "@/context/AuthContext";

export function CollaboratorList() {
  const { activeUsers } = useWebSocket();
  const { user: currentUser } = useAuth();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Collaborators ({activeUsers.length})</h3>
         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400">Live</span>
         </div>
      </div>
      
      <div className="space-y-2">
        {activeUsers.length === 0 && (
          <div className="p-4 text-center">
             <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">No neural entities detected in this workspace</p>
          </div>
        )}
        
        {activeUsers.map((name, idx) => (
          <div key={idx} className="group relative flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-transparent hover:border-zinc-800 transition-all cursor-pointer">
            <div className="relative">
               <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-indigo-500/30 transition-all">
                  <User size={18} />
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-100 truncate">
                    {name === currentUser?.name ? "You (Admin)" : name}
                  </span>
                  {(name === currentUser?.name) && <ShieldCheck size={12} className="text-indigo-400" />}
               </div>
               <p className="text-[10px] text-zinc-500 font-medium truncate">
                Active in session
               </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full p-4 border border-zinc-800 rounded-3xl text-xs font-bold text-zinc-500 hover:text-white hover:bg-zinc-800/40 transition-all border-dashed mt-4 group">
         + Invite more
      </button>
    </div>
  );
}
