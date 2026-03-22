"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { 
  History, 
  Search, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Calendar, 
  Clock, 
  Filter, 
  MoreVertical, 
  ArrowRight,
  FileText,
  Brain
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { queryApi } from "@/api/query";
import ProtectedRoute from "@/components/ProtectedRoute";

interface QueryHistoryItem {
  id: string;
  question: string;
  response: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { activeSession } = useSession();

  const fetchHistory = React.useCallback(async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const data = await queryApi.getHistory(activeSession.sessionId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const filteredHistory = history.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <Navbar />
        
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5 px-1">
                  <div className="flex items-center gap-2 mb-2">
                     <History size={16} className="text-zinc-500" />
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Workspace Insights</span>
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight">Query <span className="text-indigo-400">History</span></h1>
                  <p className="text-zinc-500 font-medium font-sans">Browse through the collective intelligence generated in your sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative group lg:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-all pointer-events-none" />
                      <input 
                        type="text" 
                        placeholder="Filter history..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full bg-zinc-900/60 border border-zinc-800/40 rounded-xl pl-9 pr-4 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700 font-sans" 
                      />
                   </div>
                   <Button variant="outline" className="h-10 border-zinc-900 text-zinc-500 hover:text-white px-4">
                      <Filter size={14} />
                   </Button>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-4">
                 {loading ? (
                   <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-zinc-900/40 border border-zinc-800 rounded-2xl" />
                      ))}
                   </div>
                 ) : filteredHistory.length === 0 ? (
                   <div className="p-20 text-center rounded-[40px] bg-zinc-900/20 border border-dashed border-zinc-800/40">
                      <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-700 mx-auto mb-6">
                         <Brain size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-zinc-400 mb-2">No History Recorded</h2>
                      <p className="text-zinc-600 text-sm font-medium">Start querying your workspace to build your collective knowledge library.</p>
                   </div>
                 ) : filteredHistory.map((item) => {
                   const isExpanded = expandedId === item.id;
                   return (
                     <Card 
                       key={item.id} 
                       className={cn(
                         "bg-zinc-900/30 border-zinc-800/40 p-0 overflow-hidden transition-all duration-300 hover:border-zinc-700/60 shadow-sm",
                         isExpanded && "border-indigo-500/20 bg-indigo-500/5 shadow-2xl shadow-indigo-500/5 scale-[1.01]"
                       )}
                     >
                       <div 
                         className="p-5 flex items-center justify-between cursor-pointer group"
                         onClick={() => setExpandedId(isExpanded ? null : item.id)}
                       >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                             <div className={cn(
                               "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                               isExpanded ? "bg-indigo-500 text-white" : "bg-zinc-950 border border-zinc-900 text-zinc-600 group-hover:text-zinc-300"
                             )}>
                                <MessageSquare size={18} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                  "text-sm font-bold tracking-tight truncate",
                                  isExpanded ? "text-indigo-100" : "text-zinc-300 group-hover:text-white"
                                )}>
                                  {item.question}
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                   <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                                      <Calendar size={12} />
                                      <span>{formatDate(item.timestamp)}</span>
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                                      <Clock size={12} />
                                      <span>{formatTime(item.timestamp)}</span>
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 rounded-md">
                                      <FileText size={10} />
                                      <span>Grounded Response</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 ml-6 shrink-0">
                             {isExpanded ? <ChevronUp size={20} className="text-indigo-400" /> : <ChevronDown size={20} className="text-zinc-700 group-hover:text-zinc-400" />}
                          </div>
                       </div>
  
                       <div className={cn(
                         "overflow-hidden transition-all duration-500 px-5",
                         isExpanded ? "max-h-[800px] pb-6 opacity-100" : "max-h-0 opacity-0"
                       )}>
                          <div className="h-[1px] w-full bg-indigo-500/10 mb-6" />
                          <div className="bg-zinc-950/60 rounded-2xl border border-zinc-900 p-6 relative group/content">
                             <div className="absolute top-4 right-4 text-indigo-500 opacity-20 pointer-events-none group-hover/content:opacity-40 transition-opacity">
                                <Sparkles size={24} />
                             </div>
                             <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Neural Response</h4>
                             <p className="text-sm font-medium text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
                               {item.response}
                             </p>
                             
                             <div className="mt-8 flex items-center justify-between">
                                <div className="flex gap-4">
                                   <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors">Copy Insight</button>
                                   <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors">View Source Link</button>
                                </div>
                                <Button variant="outline" size="sm" className="h-9 gap-2 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10 rounded-xl px-4 group/btn">
                                   <span className="text-xs font-bold font-sans">Open in Editor</span>
                                   <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                             </div>
                          </div>
                       </div>
                     </Card>
                   );
                 })}
              </div>

              <div className="text-center py-10 opacity-30">
                 <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em]">Neural Retrieval Repository v4.2.0 Sync</p>
              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
