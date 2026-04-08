import * as React from "react";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Sparkles } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";

export function CollaboratorList() {
  const { activeUsers } = useWebSocket();
  const { user: currentUser } = useAuth();
  const { activeSession } = useSession();

  const handleInvite = () => {
    if (activeSession) {
      navigator.clipboard.writeText(activeSession.sessionCode);
      // Removed standard alert for better UX flow
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Collaborators ({activeUsers.length})</h3>
         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Live</span>
         </div>
      </div>
      
      <div className="space-y-2">
        {activeUsers.length === 0 && (
          <div className="p-4 text-center">
             <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">No neural entities detected in this workspace</p>
          </div>
        )}
        
        {activeUsers.map((u, idx) => {
          const isAdmin = u.email === activeSession?.createdByEmail;
          const isMe = u.email === currentUser?.email;
          
          return (
            <div key={idx} className="group relative flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-transparent hover:border-zinc-800 transition-all cursor-pointer">
              <div className="relative">
                 <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden text-zinc-400 group-hover:border-indigo-500/30 transition-all">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                 </div>
                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-zinc-100 truncate">
                      {u.name} {isMe && "(You)"} {isAdmin && <span className="text-[10px] text-indigo-400 font-bold ml-1 uppercase tracking-tighter">Admin</span>}
                    </span>
                    {isAdmin && <ShieldCheck size={12} className="text-indigo-400" />}
                 </div>
                 <p className="text-[10px] text-zinc-500 font-medium truncate">
                   {isAdmin ? "Workspace Controller" : "Neural Participant"}
                 </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={handleInvite}
        className="w-full p-4 border border-zinc-800 rounded-3xl text-xs font-bold text-zinc-500 hover:text-white hover:bg-zinc-800/40 transition-all border-dashed mt-4 group focus:ring-1 focus:ring-indigo-500/50"
      >
         + Invite more
      </button>
    </div>
  );
}
