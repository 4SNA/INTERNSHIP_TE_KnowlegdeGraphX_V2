"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { DocumentExplorer } from "@/components/Workspace/DocumentExplorer";
import { CollaboratorList } from "@/components/Workspace/CollaboratorList";
import { WorkspaceChatUI } from "@/components/Workspace/WorkspaceChatUI";
import { Button } from "@/components/Button";
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
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SessionWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const sessionId = id || "ALPHA-78X";

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
                 <div className="flex items-center gap-2 mt-0.5 group cursor-pointer">
                    <span className="text-sm font-bold text-indigo-400 font-mono tracking-tighter uppercase">{sessionId}</span>
                    <button className="text-zinc-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"><Copy size={12} /></button>
                 </div>
              </div>
           </div>
           
           <div className="h-8 w-[1px] bg-zinc-800 mx-4 hidden lg:block" />
           
           <div className="hidden lg:flex items-center gap-4">
              <div className="flex -space-x-3">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-500 group-hover:border-indigo-500/30 transition-all cursor-pointer">
                       {String.fromCharCode(64 + i)}
                    </div>
                 ))}
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">Collaborators</span>
                 <span className="text-xs font-extrabold text-zinc-200">12 Active Now</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-1 py-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"><Video size={18} /></button>
              <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"><Monitor size={18} /></button>
              <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"><PhoneCall size={18} /></button>
              <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
              <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"><Settings2 size={18} /></button>
           </div>
           <Button className="h-11 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 font-bold gap-3 group">
              <Share2 size={16} className="text-white" />
              <span className="text-white">Invite Code</span>
           </Button>
           <button className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all group">
              <MoreHorizontal size={20} className="group-hover:rotate-90 transition-all duration-300" />
           </button>
        </div>
      </header>
      
      {/* Workspace Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Background blobs for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
           <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse-slow" />
           <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse-slow [animation-delay:-2s]" />
        </div>

        {/* Left: Document Explorer */}
        <aside className="w-[280px] h-full border-r border-zinc-900 bg-zinc-950/40 p-6 hidden xl:block">
           <DocumentExplorer />
        </aside>
        
        {/* Center: Workspace Chat */}
        <main className="flex-1 h-full min-w-0 p-4 lg:p-6 flex flex-col">
           <div className="flex-1 min-h-0">
              <WorkspaceChatUI />
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
                 <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Session highlights: Focus on Q1 Market edge. Citations: R&D cycle & Manifestos. Proposed next steps: Scalability audit.</p>
                 <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl h-9">Full Report →</Button>
              </div>

              <div className="flex items-center gap-3 px-2">
                 <ShieldCheck size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">End-to-end Encrypted</span>
              </div>
           </div>
        </aside>
      </div>

    </div>
  );
}
