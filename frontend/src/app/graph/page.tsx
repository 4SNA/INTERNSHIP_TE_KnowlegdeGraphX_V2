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
  Share2, 
  Settings2, 
  Plus, 
  Sparkles, 
  Trash2, 
  ArrowRight,
  ChevronRight,
  Database
} from "lucide-react";

export default function GraphPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6 overflow-hidden">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
             <div className="space-y-1.5 px-2">
                <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Network size={14} />
                   </div>
                   <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Neural Mapping Protocol</span>
                </div>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold tracking-tighter">Graph</span></h1>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-lg">Visualize multidimensional connections and entity clusters across your workspace documents.</p>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="relative group lg:w-48">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                   <input type="text" placeholder="Find entities..." className="h-10 w-full bg-zinc-900/60 border border-zinc-900 rounded-xl pl-9 pr-2 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700 font-bold" />
                </div>
                <Button variant="outline" className="h-10 border-zinc-900 bg-zinc-900/40 text-zinc-500 hover:text-white px-4">
                   <Settings2 size={16} />
                </Button>
                <Button className="h-10 gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/10 px-6 rounded-xl">
                   <Plus size={16} className="text-white" />
                   <span className="text-white font-bold text-xs uppercase tracking-widest">Add Concept</span>
                </Button>
             </div>
          </header>

          <div className="flex-1 flex gap-6 min-h-0">
             
             {/* LEFT: Explorer Pane */}
             <div className="w-[300px] flex flex-col gap-6 shrink-0 hidden xl:flex">
                <Card className="flex-1 bg-zinc-900/30 border-zinc-900/40 p-6 flex flex-col gap-6 overflow-hidden glass rounded-[40px]">
                   <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                      <h3 className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Database size={12} />
                        Connected Nodes
                      </h3>
                      <button className="text-zinc-700 hover:text-zinc-400 transition-colors"><Trash2 size={14} /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                      <GraphListItem name="Scalability Protocol" count={8} color="border-indigo-500/40 text-indigo-400" />
                      <GraphListItem name="Neural Acceleration" count={12} color="border-purple-500/40 text-purple-400" />
                      <GraphListItem name="Privacy First" count={5} />
                      <GraphListItem name="Market Strategy" count={15} color="border-cyan-500/40 text-cyan-400" />
                      <GraphListItem name="User Feedback" count={22} color="border-emerald-500/40 text-emerald-400" />
                      <GraphListItem name="R&D Guidelines" count={3} />
                   </div>
                   
                   <div className="mt-auto pt-6 border-t border-zinc-800 space-y-4">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace Insights</h4>
                      <div className="flex flex-col gap-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                         <div className="flex items-center justify-between">
                            <Sparkles size={14} className="text-indigo-400" />
                            <ChevronRight size={12} className="text-zinc-700 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                         </div>
                         <p className="text-[11px] font-bold text-zinc-200 mt-1">Cluster Detected: Infrastructure Expansion</p>
                         <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Auto-generated thematic grouping across 4 documents.</p>
                      </div>
                   </div>
                </Card>
             </div>

             {/* MAIN: Full Graph View */}
             <div className="flex-1 min-w-0 h-full relative group">
                <InteractiveGraph />
             </div>

          </div>

        </main>
      </div>
    </div>
  );
}

function GraphListItem({ name, count, color = "border-zinc-800 text-zinc-500" }: any) {
  return (
    <div className={cn("flex flex-col gap-2 p-3 rounded-2xl bg-zinc-950 border transition-all cursor-pointer group hover:bg-zinc-900", color)}>
       <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold truncate group-hover:text-white transition-colors">{name}</p>
          <div className="px-1.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] font-extrabold group-hover:text-indigo-400 transition-colors">{count}</div>
       </div>
       <div className="flex items-center gap-1">
          {[1,2,3].map(i => <div key={i} className="h-1 rounded-full bg-zinc-900 flex-1 overflow-hidden"><div className="h-full w-2/3 bg-current opacity-30 group-hover:opacity-60 transition-opacity" /></div>)}
       </div>
    </div>
  );
}
