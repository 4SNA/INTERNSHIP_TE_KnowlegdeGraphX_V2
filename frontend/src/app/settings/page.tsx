"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Database, 
  Lock, 
  Bell, 
  Zap, 
  Globe, 
  Cpu, 
  Eye, 
  Moon,
  ChevronRight,
  Palette
} from "lucide-react";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <Navbar />
        
        <div className="flex flex-1 overflow-hidden relative text-zinc-100">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 custom-scrollbar no-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Global <span className="text-indigo-400">Control Node</span></h1>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed uppercase tracking-widest opacity-70">
                  System Configuration & Neural Parameters
                </p>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                
                {/* Visual Identity Section */}
                <section className="space-y-6">
                   <div className="flex items-center gap-3 px-1">
                      <Palette size={20} className="text-indigo-400" />
                      <h2 className="text-lg font-bold tracking-tight">Interface Optimization</h2>
                   </div>
                   <Card className="p-1 rounded-[32px] bg-zinc-900/40 border-zinc-800/60 glass overflow-hidden">
                      <div className="divide-y divide-zinc-800/40">
                         <SettingsToggle icon={Moon} label="Midnight Protocol" description="Deep space high-contrast theme" defaultChecked />
                         <SettingsToggle icon={Eye} label="Neural Focus" description="Enable glassmorphism and blur effects" defaultChecked />
                         <SettingsToggle icon={Zap} label="Performance Mode" description="Reduce animations for faster sync" />
                      </div>
                   </Card>
                </section>

                {/* Neural Sync Section */}
                <section className="space-y-6">
                   <div className="flex items-center gap-3 px-1">
                      <Cpu size={20} className="text-purple-400" />
                      <h2 className="text-lg font-bold tracking-tight">Neural Intelligence</h2>
                   </div>
                   <Card className="p-1 rounded-[32px] bg-zinc-900/40 border-zinc-800/60 glass overflow-hidden">
                      <div className="divide-y divide-zinc-800/40">
                         <SettingsLink icon={Database} label="Knowledge Sources" description="Manage indexed vector databases" />
                         <SettingsLink icon={Globe} label="Global Reasoning" description="Configure LLM model temperature" />
                         <SettingsToggle icon={Bell} label="Auto-Indexing" description="Notify when embedding completes" defaultChecked />
                      </div>
                   </Card>
                </section>

                {/* Security Section */}
                <section className="md:col-span-2 space-y-6">
                   <div className="flex items-center gap-3 px-1">
                      <Lock size={20} className="text-emerald-400" />
                      <h2 className="text-lg font-bold tracking-tight">Access & Authorization</h2>
                   </div>
                   <Card className="p-8 rounded-[40px] bg-zinc-900/40 border-zinc-800/60 glass grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                         <p className="text-sm font-bold">Encrypted Storage</p>
                         <p className="text-xs text-zinc-500 leading-relaxed">Your neural graph is stored using AES-256 encryption at the hardware level.</p>
                         <Button variant="outline" className="h-10 rounded-xl px-4 text-xs">Verify Integrity</Button>
                      </div>
                      <div className="space-y-2">
                         <p className="text-sm font-bold">OAuth Providers</p>
                         <p className="text-xs text-zinc-500 leading-relaxed">Connect external identities for easier workspace synchronization.</p>
                         <Button variant="outline" className="h-10 rounded-xl px-4 text-xs">Manage Auth</Button>
                      </div>
                      <div className="space-y-2">
                         <p className="text-sm font-bold">Session Security</p>
                         <p className="text-xs text-zinc-500 leading-relaxed">Automatically terminate sessions after 24 hours of inactivity.</p>
                         <Button variant="outline" className="h-10 rounded-xl px-4 text-xs">Policy Details</Button>
                      </div>
                   </Card>
                </section>

              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SettingsToggle({ icon: Icon, label, description, defaultChecked = false }: any) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-zinc-800/20 transition-colors group cursor-pointer">
      <div className="flex gap-4">
         <div className="mt-1">
            <Icon size={18} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
         </div>
         <div>
            <p className="text-sm font-bold text-zinc-100">{label}</p>
            <p className="text-xs text-zinc-500">{description}</p>
         </div>
      </div>
      <div className={cn(
        "w-10 h-6 rounded-full transition-all relative flex items-center p-1",
        defaultChecked ? "bg-indigo-600" : "bg-zinc-800"
      )}>
         <div className={cn(
           "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
           defaultChecked ? "translate-x-4" : "translate-x-0"
         )} />
      </div>
    </div>
  );
}

function SettingsLink({ icon: Icon, label, description }: any) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-zinc-800/20 transition-colors group cursor-pointer">
      <div className="flex gap-4">
         <div className="mt-1">
            <Icon size={18} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
         </div>
         <div>
            <p className="text-sm font-bold text-zinc-100">{label}</p>
            <p className="text-xs text-zinc-500">{description}</p>
         </div>
      </div>
      <ChevronRight size={18} className="text-zinc-700 group-hover:text-zinc-400 transition-all group-hover:translate-x-1" />
    </div>
  );
}
