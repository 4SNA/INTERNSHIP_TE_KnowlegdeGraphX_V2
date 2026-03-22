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
  MessageSquareShare
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Dynamic Background Blurs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[140px] -z-10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] -z-10 rounded-full translate-x-1/2 translate-y-1/2" />

        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth custom-scrollbar focus:outline-none" tabIndex={-1}>
          <div className="max-w-[1400px] mx-auto space-y-12 pb-24">
            
            {/* HER0 & ACTION SECTION */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)] animate-pulse" />
                   <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-[0.2em] px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">System Online</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.1]">
                  Neural Knowledge <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Command Center</span>
                </h1>
                <p className="text-zinc-500 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                  KnowledgeGraphX leverages advanced RAG architectures to unify your organizational intelligence. 
                  Collaborate, query, and visualize in real-time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                 <Button variant="outline" className="h-14 gap-3 bg-zinc-900/40 text-zinc-300 px-8 rounded-[24px]">
                    <FileUp size={20} />
                    <span>Upload Documents</span>
                 </Button>
                 <Button className="h-14 gap-3 px-10 rounded-[24px] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all">
                    <Plus size={20} className="text-white" />
                    <span>Create New Session</span>
                 </Button>
              </div>
            </header>

            {/* QUICK METRICS GRID */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" aria-label="Quick Stats">
               <StatCard icon={Files} label="Data Ingested" value="2.4 GB" change="+12.4%" />
               <StatCard icon={Users} label="Collaborators" value="12" change="Live" color="text-indigo-400" />
               <StatCard icon={BarChart2} label="AI Insights" value="1,280" change="+42 Today" color="text-purple-400" />
               <StatCard icon={Clock} label="Avg Response" value="0.8s" change="-200ms" />
            </section>

            {/* COLLABORATIVE SESSIONS GRID */}
            <section className="space-y-6">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm">
                        <Users2 size={24} />
                     </div>
                     <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">Active Sessions</h2>
                  </div>
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-indigo-400 gap-2 font-bold group">
                    Explore All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <SessionCard code="ALPHA-78X" usersCount={8} />
                  <SessionCard code="BETA-22Z" usersCount={15} />
                  <SessionCard code="INTERNAL-AI" usersCount={4} />
                  <div className="border-2 border-dashed border-zinc-900 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all active:scale-[0.98] min-h-[160px]">
                     <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-indigo-400 group-hover:bg-zinc-800 transition-all">
                        <Plus size={28} />
                     </div>
                     <p className="text-[10px] font-extrabold text-zinc-600 group-hover:text-indigo-400 uppercase tracking-[0.2em]">Start New Collaboration</p>
                  </div>
               </div>
            </section>

            {/* KNOWLEDGE & QUERIES BENTO-ISH GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
               {/* DOCUMENTS (LEFT 8 COLUMNS) */}
               <section className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                          <FileText size={24} />
                       </div>
                       <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">Recent Knowledge</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-purple-400 gap-2 font-bold group">
                       Open Directory <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                     <DocumentCard name="Project_Manifesto_v2" size="4.2 MB" date="2h ago" />
                     <DocumentCard name="Market_Analysis_Q1" size="2.1 MB" date="5h ago" />
                     <DocumentCard name="User_Feedback_Report" size="840 KB" date="Yesterday" />
                  </div>
               </section>

               {/* RECENT QUERIES (RIGHT 4 COLUMNS) */}
               <section className="lg:col-span-4 space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          <MessageSquareShare size={24} />
                       </div>
                       <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">AI Stream</h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                     <QueryCard 
                        query="What is our R&D strategy?" 
                        response="Our R&D strategy focuses on integrating high-performance AI models..." 
                        timestamp="10m ago" 
                     />
                     <QueryCard 
                        query="Summarize user feedback" 
                        response="Users are overwhelmingly positive about the new dashboard..." 
                        timestamp="1h ago" 
                     />
                     <div className="p-6 bg-zinc-900/10 rounded-[32px] border border-zinc-900/60 text-center border-dashed backdrop-blur-sm group cursor-pointer hover:bg-zinc-900/30 transition-all">
                        <p className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-[0.3em] group-hover:text-zinc-500 transition-colors">Neural Stream Sync Complete</p>
                     </div>
                  </div>
               </section>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, color = "text-zinc-100" }: any) {
  return (
    <Card className="hover:scale-[1.03] active:scale-[0.98]" variant="glass">
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-2xl bg-zinc-800/80 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all border border-zinc-700/50">
          <Icon size={24} className="text-zinc-400 group-hover:text-indigo-400" />
        </div>
        <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm uppercase tracking-widest">
          {change}
        </span>
      </div>
      <div className="mt-8">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{label}</h3>
        <p className={cn("text-4xl font-extrabold mt-2 tracking-tighter leading-none", color)}>{value}</p>
      </div>
    </Card>
  );
}
