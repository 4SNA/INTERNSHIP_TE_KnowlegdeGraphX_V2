"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { InteractiveGraph } from "@/components/Graph/InteractiveGraph";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { 
  Network, 
  Search, 
  Settings2, 
  Plus, 
  Sparkles, 
  Trash2, 
  ChevronRight,
  Database,
  Brain,
  Share2
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { useDocuments } from "@/context/DocumentContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NewInsightModal } from "@/components/NewInsightModal";

export default function GraphPage() {
  const { activeSession } = useSession();
  const { documents, loading: docsLoading } = useDocuments();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isInsightModalOpen, setIsInsightModalOpen] = React.useState(false);
  const [showShareToast, setShowShareToast] = React.useState(false);

  const handleShare = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(`http://localhost:3000/graph?session=${activeSession.sessionCode}`);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <Navbar />
        
        {/* Global Share Toast */}
        {showShareToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-500">
             <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900/90 border border-indigo-500/30 backdrop-blur-md rounded-2xl shadow-2xl">
                <Share2 size={16} className="text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-tight">Workspace Coordinates Copied</span>
             </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6 overflow-hidden no-scrollbar">
            
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 pt-2 lg:pt-4">
               <div className="space-y-1.5 px-2">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="p-1 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Network size={14} />
                     </div>
                     <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Neural Mapping Engine</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold tracking-tighter">Graph</span></h1>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-lg font-sans">
                    {activeSession ? `Visualizing connections for Workspace #${activeSession.sessionCode}` : 'Join a workspace to visualize intelligence connections.'}
                  </p>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="relative group lg:w-48">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors pointer-events-none" />
                     <input 
                      type="text" 
                      placeholder="Neural search..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 w-full bg-zinc-900/60 border border-zinc-900 rounded-xl pl-9 pr-2 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans font-bold" 
                     />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    className="h-10 border-zinc-900 bg-zinc-900/40 text-zinc-500 hover:text-white px-4"
                  >
                     <Share2 size={16} />
                  </Button>
                  <Button 
                    onClick={() => setIsInsightModalOpen(true)}
                    className="h-10 gap-2 bg-indigo-600 shadow-lg shadow-indigo-500/20 px-6 rounded-xl hover:bg-indigo-500"
                  >
                     <Plus size={16} className="text-white" />
                     <span className="text-white font-bold text-xs uppercase tracking-widest">Add Insight</span>
                  </Button>
               </div>
            </header>
            
            <NewInsightModal 
              isOpen={isInsightModalOpen}
              onClose={() => setIsInsightModalOpen(false)}
            />

            <div className="flex-1 flex gap-6 min-h-0">
               
               {/* LEFT: Knowledge Sidebar */}
               <div className="w-[300px] flex flex-col gap-6 shrink-0 hidden xl:flex overflow-hidden">
                  <Card className="flex-1 bg-zinc-900/30 border-zinc-900/40 p-6 flex flex-col gap-6 overflow-hidden rounded-[40px] shadow-sm">
                     <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <h3 className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Database size={12} />
                          Workspace Corpus
                        </h3>
                     </div>
                     <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 no-scrollbar">
                        {docsLoading ? (
                          [1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900/40 border border-zinc-800 rounded-2xl animate-pulse" />)
                        ) : documents.length === 0 ? (
                          <div className="py-20 text-center">
                             <Brain size={32} className="text-zinc-800 mx-auto mb-4" />
                             <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Library Empty</p>
                          </div>
                        ) : (
                          documents.map((doc) => (
                             <div key={doc.id} className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-900 transition-all cursor-pointer group hover:bg-zinc-900/60 hover:border-indigo-500/20">
                                <div className="flex items-center justify-between">
                                   <p className="text-[11px] font-bold truncate text-zinc-400 group-hover:text-indigo-100 transition-colors uppercase tracking-tight">{doc.fileName}</p>
                                   <div className="px-1.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] font-extrabold text-indigo-400">RAG</div>
                                </div>
                                <div className="flex items-center gap-1">
                                   <div className="h-1 rounded-full bg-zinc-900 flex-1 overflow-hidden">
                                      <div className="h-full w-full bg-indigo-500 animate-pulse-slow" />
                                   </div>
                                </div>
                             </div>
                          ))
                        )}
                     </div>
                     
                     <div className="mt-auto pt-6 border-t border-zinc-800 space-y-4">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auto-Discovery</h4>
                        <div className="flex flex-col gap-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                           <div className="flex items-center justify-between">
                              <Sparkles size={14} className="text-indigo-400" />
                              <ChevronRight size={12} className="text-zinc-700 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                           </div>
                           <p className="text-[11px] font-bold text-zinc-200 mt-1 uppercase tracking-tight">Active Pattern Detected</p>
                           <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium font-sans">
                             High density cluster across {documents.length} knowledge sources.
                           </p>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* MAIN: Full Graph View */}
               <div className="flex-1 min-w-0 h-full relative group rounded-[40px] overflow-hidden border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                  <InteractiveGraph />
               </div>

            </div>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
