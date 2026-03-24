"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SessionCard } from "@/components/Dashboard/SessionCard";
import { 
  Users2, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  LayoutGrid, 
  History,
  Brain,
  Sparkles,
  SearchCode
} from "lucide-react";
import { sessionApi } from "@/api/session";
import { useSession } from "@/context/SessionContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/lib/utils";

export default function WorkspacesPage() {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { activeSession, createSession } = useSession();
  const router = useRouter();

  const fetchWorkspaces = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionApi.getMySessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const filteredSessions = sessions.filter(s => 
    s.sessionCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      await createSession();
      fetchWorkspaces();
    } catch (e) {
      alert("Neural sync failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <Navbar />
        
        <div className="flex flex-1 overflow-hidden relative text-zinc-100">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 custom-scrollbar no-scrollbar scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
              
              {/* Header */}
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <LayoutGrid size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-[0.2em]">Neural Network Registry</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-100 tracking-tight leading-none">
                    Workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
                  </h1>
                  <p className="text-zinc-500 font-medium max-w-xl text-lg">
                    Manage and reconnect with your collective intelligence architectures and collaborative teams.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search code..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 w-64 bg-zinc-900/40 border border-zinc-800 rounded-2xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-700 font-sans"
                    />
                  </div>
                  <Button 
                    onClick={handleCreate}
                    className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold gap-3 shadow-lg shadow-indigo-500/10"
                  >
                    <Plus size={20} />
                    <span>Generate Workspace</span>
                  </Button>
                </div>
              </header>

              {/* Grid Section */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">Neural Archive</h2>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{sessions.length} Enrolled</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-indigo-400 font-bold gap-2">
                      <History size={14} /> History
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-44 rounded-[40px] bg-zinc-900/30 animate-pulse border border-zinc-800/40" />
                    ))}
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="p-32 text-center rounded-[60px] bg-zinc-900/10 border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center space-y-6">
                     <div className="w-20 h-20 rounded-[32px] bg-zinc-900 flex items-center justify-center text-zinc-700 shadow-inner">
                        <SearchCode size={40} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-zinc-400">Registry Is Empty</h3>
                        <p className="text-zinc-600 font-medium max-w-sm mx-auto mt-2">Initialize your first workspace to begin building your neural intelligence library.</p>
                     </div>
                     <Button onClick={handleCreate} variant="outline" className="border-indigo-500/20 text-indigo-400 px-10 h-12 rounded-2xl hover:bg-indigo-500/10">Start Mapping</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredSessions.map((session) => (
                      <div 
                        key={session.sessionId} 
                        className="space-y-3 group"
                      >
                         <div 
                           onClick={() => router.push(`/session/${session.sessionCode}`)}
                           className="cursor-pointer"
                         >
                            <SessionCard 
                               code={session.sessionCode} 
                               usersCount={session.memberCount} 
                               avatars={session.collaborators}
                               active={activeSession?.sessionCode === session.sessionCode} 
                            />
                         </div>
                         
                         {/* COLLABORATOR IDENTITIES */}
                         <div className="px-5 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                           {session.collaboratorNames && session.collaboratorNames.slice(0, 3).map((name: string, i: number) => (
                             <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/60 border border-zinc-900 text-[9px] font-bold text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/20 transition-all cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                                {name}
                             </div>
                           ))}
                           {session.memberCount > 3 && (
                             <span className="text-[9px] font-bold text-zinc-600 self-center uppercase tracking-widest">+ {session.memberCount - 3} Others</span>
                           )}
                         </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={handleCreate}
                      className="border-2 border-dashed border-zinc-900 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all min-h-[160px]"
                    >
                       <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-indigo-400 group-hover:bg-zinc-900 transition-all shadow-xl group-hover:scale-110">
                          <Plus size={32} />
                       </div>
                       <p className="text-[11px] font-extrabold text-zinc-600 group-hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors">Generate New Node</p>
                    </button>
                  </div>
                )}
              </section>

              {/* Info Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12">
                 <div className="lg:col-span-2 p-10 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors">
                       <Sparkles size={64} />
                    </div>
                    <h3 className="text-2xl font-extrabold mb-4 tracking-tight">Collaborative Intelligence</h3>
                    <p className="text-zinc-400 font-medium leading-relaxed max-w-xl">
                       Your workspaces are shared environments where multiple operators can index documents and generate insights collectively. All neural identities involved in a session are tracked and indexed here.
                    </p>
                    <div className="flex gap-6 mt-8">
                       <div className="space-y-1">
                          <p className="text-2xl font-extrabold text-indigo-400">{sessions.length}</p>
                          <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Total Nodes</p>
                       </div>
                       <div className="w-[1px] h-12 bg-zinc-800" />
                       <div className="space-y-1">
                          <p className="text-2xl font-extrabold text-purple-400">{sessions.reduce((acc, s) => acc + (s.memberCount || 0), 0)}</p>
                          <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Active Operators</p>
                       </div>
                    </div>
                 </div>

                 <Card className="p-10 rounded-[40px] bg-indigo-600 flex flex-col justify-between shadow-2xl shadow-indigo-500/20 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="space-y-4">
                       <h3 className="text-2xl font-extrabold text-white tracking-tight">Ready to expand?</h3>
                       <p className="text-white/70 font-medium text-sm leading-relaxed">
                          Every new workspace increases your neural coverage and collective knowledge throughput.
                       </p>
                    </div>
                    <Button 
                      onClick={handleCreate}
                      variant="outline" 
                      className="mt-8 h-14 bg-white text-indigo-600 border-none hover:bg-zinc-100 rounded-2xl font-extrabold transition-all active:scale-95 text-lg"
                    >
                       Launch Workspace
                    </Button>
                 </Card>
              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
