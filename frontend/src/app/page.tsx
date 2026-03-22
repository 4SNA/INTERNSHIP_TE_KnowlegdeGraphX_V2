"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SessionCard } from "@/components/Dashboard/SessionCard";
import { DocumentCard } from "@/components/Dashboard/DocumentCard";
import { QueryCard } from "@/components/Dashboard/QueryCard";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  FileUp, 
  History, 
  Sparkles, 
  Users, 
  Files, 
  BarChart2, 
  ArrowRight,
  Clock,
  Users2,
  FileText,
  MessageSquareShare,
  Brain
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { useDocuments } from "@/context/DocumentContext";
import { useChat } from "@/context/ChatContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const { activeSession, createSession, loading: sessionLoading } = useSession();
  const { documents, loading: docsLoading } = useDocuments();
  const { messages, isLoading: chatLoading } = useChat();
  const router = useRouter();

  const handleCreateSession = async () => {
    try {
      await createSession();
      // Router will happen in useEffect to ensure state is synced
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (activeSession) {
      // Stay on dashboard, but we can have an 'Open' button or auto-navigate
    }
  }, [activeSession]);

  const openSession = (code: string) => {
    router.push(`/session/${code}`);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <Navbar />
        
        <div className="flex flex-1 overflow-hidden relative text-zinc-100">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 no-scrollbar focus:outline-none" tabIndex={-1}>
            <div className="max-w-[1400px] mx-auto space-y-12 pb-24">
              
              {/* HERO & ACTION SECTION */}
              <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-1000">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)] animate-pulse" />
                     <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-[0.2em] px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">System Live</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-zinc-100 tracking-tight leading-[1.1]">
                    Welcome back,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">{user?.name || "Neural Operator"}</span>
                  </h1>
                  <p className="text-zinc-500 font-medium max-w-xl text-sm md:text-lg leading-relaxed font-sans">
                    Your collective workspace is synchronized. KnowledgeGraphX has indexed {documents.length} sources across your active sessions.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                   <Link href="/documents">
                     <Button variant="outline" className="h-14 gap-3 bg-zinc-900/40 border-zinc-800 text-zinc-300 px-8 rounded-[24px] hover:bg-zinc-800 transition-all font-bold">
                        <FileUp size={20} />
                        <span>Manage Documents</span>
                     </Button>
                   </Link>
                   <Button 
                    onClick={handleCreateSession}
                    disabled={sessionLoading}
                    className="h-14 gap-3 px-10 rounded-[24px] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all font-bold bg-indigo-600 hover:bg-indigo-500"
                   >
                      <Plus size={20} className="text-white" />
                      <span>{sessionLoading ? "Initializing..." : "New Workspace"}</span>
                   </Button>
                </div>
              </header>

              {/* LIVE METRICS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                 <StatCard icon={Files} label="Sources Indexed" value={documents.length.toString()} change="+All Time" />
                 <StatCard icon={Users} label="Active Session" value={activeSession ? "Connected" : "Idle"} change={activeSession ? `#${activeSession.sessionCode}` : "None"} color={activeSession ? "text-indigo-400" : "text-zinc-600"} />
                 <StatCard icon={History} label="Queries Logged" value={messages.filter(m => m.role === 'user').length.toString()} change="Neural Sync" color="text-purple-400" />
                 <StatCard icon={Clock} label="Latency" value="0.4s" change="Optimized" />
              </section>

              {/* COLLABORATIVE SESSIONS GRID */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm">
                          <Users2 size={24} />
                       </div>
                       <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">Active Workspace</h2>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {activeSession ? (
                      <div onClick={() => openSession(activeSession.sessionCode)} className="cursor-pointer group">
                        <SessionCard code={activeSession.sessionCode} usersCount={1} active />
                      </div>
                   ) : (
                      <div 
                        onClick={handleCreateSession}
                        className="border-2 border-dashed border-zinc-900/60 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 bg-zinc-900/10 hover:bg-zinc-900/20 transition-all min-h-[160px] cursor-pointer"
                      >
                         <Brain size={32} className="text-zinc-800" />
                         <p className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-widest">No active workspace</p>
                      </div>
                   )}
                    <div 
                      onClick={handleCreateSession}
                      className="border-2 border-dashed border-zinc-900 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all active:scale-[0.98] min-h-[160px]"
                    >
                       <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-indigo-400 group-hover:bg-zinc-800 transition-all">
                          <Plus size={28} />
                       </div>
                       <p className="text-[10px] font-extrabold text-zinc-600 group-hover:text-indigo-400 uppercase tracking-[0.2em]">Start New Collaboration</p>
                    </div>
                 </div>
              </section>

              {/* KNOWLEDGE & QUERIES BENTO-ISH GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 
                 {/* RECENT DOCUMENTS */}
                 <section className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <FileText size={24} />
                         </div>
                         <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">Recent Knowledge</h2>
                      </div>
                      <Link href="/documents">
                        <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white gap-2 font-bold group">
                           Open Repository <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                    {docsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                         {[1,2,3].map(i => <div key={i} className="h-40 rounded-[32px] bg-zinc-900/40 border border-zinc-800/40 animate-pulse" />)}
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="p-12 text-center rounded-[40px] bg-zinc-900/20 border border-dashed border-zinc-800/40">
                        <p className="text-sm font-bold text-zinc-700 uppercase tracking-widest">No Documents Ingested</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                         {documents.slice(0, 3).map((doc) => (
                            <DocumentCard key={doc.id} name={doc.fileName} size={`${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`} date="Indexed" />
                         ))}
                      </div>
                    )}
                 </section>

                 {/* RECENT QUERIES */}
                 <section className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            <MessageSquareShare size={24} />
                         </div>
                         <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">Neural Feed</h2>
                      </div>
                    </div>
                    <div className="space-y-4">
                       {messages.filter(m => m.role === 'assistant').length === 0 ? (
                         <div className="p-6 bg-zinc-900/10 rounded-[32px] border border-zinc-900/60 text-center border-dashed backdrop-blur-sm">
                            <p className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-widest">Awaiting Queries...</p>
                         </div>
                       ) : (
                         messages.filter(m => m.role === 'assistant').slice(-2).map((m) => (
                           <QueryCard 
                              key={m.id}
                              query="Knowledge Retrieval" 
                              response={m.content} 
                              timestamp="Live" 
                           />
                         ))
                       )}
                       <Link href="/history">
                         <div className="p-6 bg-zinc-900/10 rounded-[32px] border border-zinc-900/60 text-center border-dashed backdrop-blur-sm group cursor-pointer hover:bg-zinc-900/30 transition-all mt-4">
                            <p className="text-[10px] font-extrabold text-zinc-500 group-hover:text-indigo-400 uppercase tracking-[0.3em] transition-colors flex items-center justify-center gap-2">
                              View Intelligence Log <ArrowRight size={12} />
                            </p>
                         </div>
                       </Link>
                    </div>
                 </section>

              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value, change, color = "text-zinc-100" }: any) {
  return (
    <Card className="hover:scale-[1.03] active:scale-[0.98] group p-6 rounded-[32px] bg-zinc-900/40 border-zinc-800/60 transition-all duration-500" variant="glass">
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
          <Icon size={24} className="text-zinc-500 group-hover:text-indigo-400" />
        </div>
        <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 shadow-sm uppercase tracking-widest">
          {change}
        </span>
      </div>
      <div className="mt-8">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{label}</h3>
        <p className={cn("text-4xl font-extrabold mt-2 tracking-tighter leading-none whitespace-nowrap", color)}>{value}</p>
      </div>
    </Card>
  );
}
