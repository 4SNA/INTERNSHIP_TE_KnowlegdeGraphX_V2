"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { DocumentExplorer } from "@/components/Workspace/DocumentExplorer";
import { CollaboratorList } from "@/components/Workspace/CollaboratorList";
import { WorkspaceChatUI } from "@/components/Workspace/WorkspaceChatUI";
import { InteractiveGraph } from "@/components/Graph/InteractiveGraph";
import { Button } from "@/components/Button";
import { ReportModal } from "@/components/ReportModal";
import { sessionApi } from "@/api/session";
import { 
  Copy, 
  Settings2, 
  Share2, 
  Users, 
  ChevronRight, 
  Brain, 
  ShieldCheck, 
  Video, 
  Monitor, 
  PhoneCall, 
  MoreHorizontal,
  X,
  AlertTriangle,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/context/WebSocketContext";
import { useSession } from "@/context/SessionContext";
import { usePopover } from "@/context/PopoverContext";

export default function SessionWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const sessionId = id || "ALPHA-78X";
  const { activeUsers } = useWebSocket();
  const { activeSession, joinSession, loading, terminateActiveSession } = useSession();
  const { activePopover, openPopover, closePopover } = usePopover();
  
  const [toasts, setToasts] = React.useState<{ id: number; message: string; type: 'info' | 'success' }[]>([]);
  const [activeView, setActiveView] = React.useState<"chat" | "graph">("chat");

  // Report State
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [reportLoading, setReportLoading] = React.useState(false);
  const [reportContent, setReportContent] = React.useState<string | null>(null);

  // Sync session state with URL on refresh
  React.useEffect(() => {
    if (!activeSession || activeSession.sessionCode !== id) {
       if (id) {
         joinSession(id).catch(err => {
           console.error("Neural sync failed for URL parameter:", err);
         });
       }
    }
  }, [id, activeSession, joinSession]);

  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionId);
    showToast(`Neural link ${sessionId} secured to clipboard`, 'success');
  };

  const handleGenerateReport = async () => {
    if (!activeSession) return;
    setIsReportOpen(true);
    setReportLoading(true);
    try {
      const report = await sessionApi.getReport(activeSession.sessionId);
      setReportContent(report);
    } catch (error) {
       console.error("Neural Synthesis Error:", error);
       setReportContent("Synthesis protocol failed. Ensure neural memory is active.");
    } finally {
       setReportLoading(false);
    }
  };

  const togglePopover = (anchor: string, title: string, description: string, icon: React.ReactNode, action?: () => void) => {
    if (activePopover?.anchor === anchor) {
      closePopover();
    } else {
      openPopover({ anchor, title, description, icon, action });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      {/* Session Workspace Header */}
      <header className="h-20 shrink-0 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                 <Users size={20} />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-zinc-100 tracking-tight">Collaboration Hub</h1>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Workspace</span>
                 </div>
                 <div className="flex items-center gap-2 mt-0.5 group cursor-pointer" onClick={handleCopyCode}>
                    <span className="text-sm font-bold text-indigo-400 font-mono tracking-tighter uppercase">{sessionId}</span>
                    <button className="text-zinc-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"><Copy size={12} /></button>
                 </div>
              </div>
           </div>
           
           <div className="h-8 w-[1px] bg-zinc-800 mx-4 hidden lg:block" />
           
           {/* View Switcher Pill */}
           <div className="hidden md:flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner">
              <button 
                onClick={() => setActiveView("chat")}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeView === "chat" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Intelli-Chat
              </button>
              <button 
                onClick={() => setActiveView("graph")}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeView === "graph" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Neural Graph
              </button>
           </div>
        </div>

        <div className="flex items-center gap-4 relative">
           <div className="flex items-center gap-2 px-1 py-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              <button 
                onClick={() => togglePopover("video", "Full Motion Neural Feed", "Visual synthesis channel is currently offline for calibration.", <Video size={20} />)} 
                className={cn("p-2.5 rounded-xl transition-all", activePopover?.anchor === "video" ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-zinc-800 text-zinc-500 hover:text-white")}
              >
                <Video size={18} />
              </button>
              <button 
                onClick={() => togglePopover("screen", "Cognitive Share", "Broadcasting neural matrix to peers is coming in the next epoch.", <Monitor size={20} />)} 
                className={cn("p-2.5 rounded-xl transition-all", activePopover?.anchor === "screen" ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-zinc-800 text-zinc-500 hover:text-white")}
              >
                <Monitor size={18} />
              </button>
              <button 
                onClick={() => togglePopover("call", "Audio Uplink", "Secure auditory resonance channel is in development.", <PhoneCall size={20} />)} 
                className={cn("p-2.5 rounded-xl transition-all", activePopover?.anchor === "call" ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-zinc-800 text-zinc-500 hover:text-white")}
              >
                <PhoneCall size={18} />
              </button>
              <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
              <button 
                onClick={() => togglePopover("settings", "OS Protocols", "Workspace-level permission parameters are currently locked.", <Settings2 size={20} />)} 
                className={cn("p-2.5 rounded-xl transition-all", activePopover?.anchor === "settings" ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-zinc-800 text-zinc-500 hover:text-white")}
              >
                <Settings2 size={18} />
              </button>
           </div>
           <Button 
            onClick={handleCopyCode}
            className="h-11 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 font-bold gap-3 group active:scale-95 transition-all"
           >
              <Share2 size={16} className="text-white" />
              <span className="text-white">Invite Code</span>
           </Button>
           <button 
              onClick={() => togglePopover(
                "terminate", 
                "Execute Neural Purge?", 
                "Executing this protocol will irreversibly terminate the session and disconnect all participants.", 
                <AlertTriangle size={24} className="text-rose-500" />,
                async () => {
                   await terminateActiveSession();
                   closePopover();
                   window.location.href = "/workspaces";
                }
              )}
              className={cn("w-11 h-11 rounded-2xl bg-zinc-900 border flex items-center justify-center transition-all group", 
                activePopover?.anchor === "terminate" ? "text-rose-500 border-rose-500/40 shadow-lg shadow-rose-950/20" : "border-zinc-800 text-zinc-500 hover:text-rose-500 hover:border-rose-500/30"
              )}
           >
              <MoreHorizontal size={20} className={cn("transition-all duration-300", activePopover?.anchor === "terminate" ? "rotate-90" : "group-hover:rotate-90")} />
           </button>
        </div>
      </header>
      
      {/* Workspace Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Background blobs for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
           <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse-slow" />
           <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow [animation-delay:-2s]" />
        </div>

        {/* Left: Document Explorer */}
        <aside className="w-[280px] h-full border-r border-zinc-900 bg-zinc-950/40 p-6 hidden xl:block">
           <DocumentExplorer />
        </aside>
        
        {/* Center: Workspace Dynamic Content */}
        <main className="flex-1 h-full min-w-0 p-4 lg:p-6 flex flex-col">
           <div className="flex-1 min-h-0">
              {activeView === "chat" ? <WorkspaceChatUI /> : <InteractiveGraph />}
           </div>
        </main>
        
        {/* Right: Collaborator List Panel */}
        <aside className="w-[320px] h-full border-l border-zinc-900 bg-zinc-950/40 p-6 hidden lg:block overflow-y-auto custom-scrollbar">
           <CollaboratorList />
           
           <div className="mt-12 space-y-6">
              <div className="p-4 rounded-[40px] bg-zinc-900/60 border border-zinc-800">
                 <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-indigo-400" />
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Neural Summary</h4>
                 </div>
                 <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Session highlights based on your neural fragments. Click below for complete synthesis.</p>
                 <Button 
                    onClick={handleGenerateReport}
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800/40 border border-zinc-800 rounded-2xl h-9"
                 >
                    Full Report →
                 </Button>
              </div>

              <div className="flex items-center gap-3 px-2">
                 <Lock size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">End-to-end Encrypted</span>
              </div>
           </div>
        </aside>
      </div>

      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        loading={reportLoading}
        report={reportContent}
      />


      {/* Neural Toasts */}
      <div className="fixed bottom-12 right-12 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
             key={toast.id} 
             className={cn(
               "pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-2xl shadow-xl animate-in slide-in-from-right-10 duration-500",
               toast.type === 'success' 
                 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 whitespace-nowrap" 
                 : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 whitespace-nowrap"
             )}
          >
             {toast.type === 'success' ? <ShieldCheck size={18} /> : <Brain size={18} />}
             <span className="text-sm font-bold tracking-tight">{toast.message}</span>
             <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-2 hover:opacity-70 transition-opacity"
             >
                <X size={14} />
             </button>
          </div>
        ))}
      </div>

    </div>
  );
}
