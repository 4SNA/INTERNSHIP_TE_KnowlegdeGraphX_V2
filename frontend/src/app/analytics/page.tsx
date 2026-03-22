"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  AreaChart, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Users, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Clock,
  LayoutDashboard
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative">
          
          <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
            
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1">
              <div className="space-y-1.5">
                 <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-sm shadow-indigo-500/5">System Analytics</span>
                 </div>
                 <h1 className="text-3xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold tracking-tighter">Insights</span></h1>
                 <p className="text-zinc-500 font-medium max-w-lg leading-relaxed">Detailed metrics on workspace engagement, query performance, and knowledge trends.</p>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="outline" className="h-11 gap-2 border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white px-6 rounded-2xl">
                    <Calendar size={16} />
                    <span className="font-bold">Last 30 Days</span>
                 </Button>
                 <Button className="h-11 gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 px-8 rounded-2xl active:scale-95 transition-all">
                    <TrendingUp size={16} className="text-white" />
                    <span className="font-extrabold text-white">Export Insight Report</span>
                 </Button>
              </div>
            </header>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatInsight label="Total Queries" value="12,842" change="+24.2%" icon={Activity} />
              <StatInsight label="Active Collaborators" value="482" change="+5.1%" icon={Users} color="text-indigo-400" />
              <StatInsight label="Knowledge Nodes" value="2,400" change="+120 today" icon={LayoutDashboard} color="text-purple-400" />
              <StatInsight label="Response Latency" value="0.8s" change="-12% improved" icon={Clock} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
               
               {/* MAIN CHART 1: Query Trends */}
               <Card className="lg:col-span-2 bg-zinc-900/40 border-zinc-900 p-8 flex flex-col gap-8 glass rounded-[40px] relative overflow-hidden group/chart cursor-pointer hover:bg-zinc-900 transition-all active:scale-[0.99]">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-zinc-200 tracking-tight">Query Volume Trends</h3>
                        <p className="text-[11px] text-zinc-500 font-medium">Daily AI interactions across the organization.</p>
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-xl">
                        <ArrowUpRight size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">+12% Daily</span>
                     </div>
                  </div>
                  
                  {/* Custom SVG Area Chart */}
                  <div className="flex-1 w-full relative group">
                    <svg viewBox="0 0 800 250" className="w-full h-full overflow-visible">
                        <defs>
                           <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                           </linearGradient>
                           <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#a855f7" />
                           </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                          <line key={i} x1="0" y1={i * 62.5} x2="800" y2={i * 62.5} stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
                        ))}
                        {/* Area Path */}
                        <path 
                           d="M0,250 L0,180 C100,200 200,80 300,120 C400,160 500,60 600,100 C700,140 800,40 800,250 Z" 
                           fill="url(#areaGrad)" 
                           className="transition-all duration-1000 group-hover:opacity-60"
                        />
                        {/* Line Path */}
                        <path 
                           d="M0,180 C100,200 200,80 300,120 C400,160 500,60 600,100 C700,140 800,40" 
                           fill="none" 
                           stroke="url(#lineGrad)" 
                           strokeWidth="4" 
                           strokeLinecap="round" 
                           className="animate-in fade-in transition-all duration-1000 group-hover:scale-y-105"
                        />
                        {/* Interactive dots */}
                        {[0, 300, 600, 800].map((x, i) => (
                          <circle key={i} cx={x} cy={i % 2 ? 120 : 180} r="6" fill="#6366f1" className="animate-pulse shadow-glow shadow-indigo-500" strokeWidth="3" stroke="#09090b" />
                        ))}
                    </svg>
                  </div>
               </Card>

               {/* SIDE PANEL: Most Queried Topics */}
               <Card className="bg-zinc-900/40 border-zinc-900 p-8 flex flex-col gap-8 rounded-[40px] glass relative overflow-hidden group/side hover:bg-zinc-900 transition-all cursor-pointer">
                  <div className="space-y-1">
                     <h3 className="text-lg font-extrabold text-zinc-200 tracking-tight">Thematic Clusters</h3>
                     <p className="text-[11px] text-zinc-500 font-medium">Most queried knowledge topics.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-5">
                     <TopicBar label="Scalability Architecture" percentage="78%" color="bg-indigo-500" />
                     <TopicBar label="Market Penetration" percentage="62%" color="bg-purple-500" />
                     <TopicBar label="R&D Strategy" percentage="45%" color="bg-cyan-500" />
                     <TopicBar label="User Behavioral Data" percentage="32%" color="bg-emerald-500" />
                     <TopicBar label="Risk Management" percentage="18%" color="bg-amber-500" />
                  </div>
                  
                  <div className="mt-auto border-t border-zinc-800 pt-6">
                     <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group cursor-pointer hover:bg-indigo-500/10 transition-all border-dashed">
                        <Sparkles size={16} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                        <div className="flex-1">
                           <p className="text-[11px] font-extrabold text-zinc-200 uppercase tracking-widest leading-tight">AI Correlation Detected</p>
                           <p className="text-[10px] text-zinc-600 mt-0.5 leading-snug font-medium line-clamp-2 italic">Rising interest in 'Scalability' correlates with new 'Manifesto' uploads. Suggesting related session cluster...</p>
                        </div>
                     </div>
                  </div>
               </Card>

               {/* ROW 2: Activity Breakdown */}
               <Card className="bg-zinc-900/40 border-zinc-900 p-8 flex flex-col gap-6 rounded-[40px] glass">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">Active Workspace Sessions</h3>
                     <ChevronRight size={16} className="text-zinc-700" />
                  </div>
                  <div className="space-y-4">
                     <SessionInsight name="Session Alpha-78X" active={12} color="bg-indigo-500" />
                     <SessionInsight name="Session Beta-22Z" active={8} />
                     <SessionInsight name="Internal-AI Core" active={42} color="bg-purple-500" />
                  </div>
               </Card>
               
               <Card className="lg:col-span-2 bg-zinc-900/40 border-zinc-900 p-8 flex flex-col gap-6 rounded-[40px] glass">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">Global Collaborator Activity</h3>
                     <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Insights
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Queries
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 grid grid-cols-7 gap-3 py-4">
                     {[...Array(28)].map((_, i) => (
                       <div key={i} className="flex flex-col gap-1 items-center">
                          <div className={cn(
                            "w-full h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col-reverse overflow-hidden",
                            i === 14 && "border-indigo-500/50"
                          )}>
                             <div className="bg-indigo-500 w-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
                          </div>
                          <span className="text-[8px] font-bold text-zinc-800 uppercase tracking-tighter">{i + 1} Mar</span>
                       </div>
                     ))}
                  </div>
                  <div className="flex items-center justify-between mt-auto border-t border-zinc-800 pt-4 px-2">
                     <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic opacity-50">Monthly Trend Analysis Complete</p>
                     <button className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest flex items-center gap-1 group">
                        Full Activity History <ArrowRight size={12} className="group-hover:translate-x-1 transition-all" />
                     </button>
                  </div>
               </Card>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function StatInsight({ label, value, change, icon: Icon, color = "text-zinc-100" }: any) {
  return (
    <Card className="bg-zinc-900/30 border-zinc-800/60 backdrop-blur hover:bg-zinc-900/50 group border-transparent hover:border-indigo-500/20 rounded-[30px] p-6 lg:p-8 transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 rounded-2xl bg-zinc-800/50 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
          <Icon size={22} className="text-zinc-400 group-hover:text-indigo-400" />
        </div>
        <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20 shadow-sm shadow-indigo-500/5">{change}</div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">{label}</h3>
        <p className={cn("text-4xl lg:text-5xl font-extrabold tracking-tighter mt-2", color)}>{value}</p>
      </div>
    </Card>
  );
}

function TopicBar({ label, percentage, color }: any) {
  return (
    <div className="space-y-2 group cursor-pointer">
       <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors tracking-tight">{label}</span>
          <span className="text-[11px] font-bold text-zinc-600 group-hover:text-white transition-colors font-mono">{percentage}</span>
       </div>
       <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
          <div 
             className={cn("h-full rounded-full transition-all duration-1000 group-hover:brightness-125", color)} 
             style={{ width: percentage }} 
          />
       </div>
    </div>
  );
}

function SessionInsight({ name, active, color = "bg-zinc-800" }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-950/40 rounded-3xl border border-zinc-900 group cursor-pointer hover:bg-zinc-900 transition-all border-dashed">
       <div className={cn("w-2.5 h-2.5 rounded-full shrink-0 group-hover:animate-pulse", color)} />
       <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-zinc-200 truncate tracking-tight">{name}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">{active} users collaborated recently</p>
       </div>
       <ChevronRight size={14} className="text-zinc-800 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
    </div>
  );
}
