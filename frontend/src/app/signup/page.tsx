"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { Brain, Chrome, ShieldCheck, ArrowRight, UserPlus, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[140px] -z-10 rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] -z-10 rounded-full -translate-x-1/4 translate-y-1/4" />
      
      <div className="w-full max-w-lg px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-10 gap-4">
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 group cursor-pointer hover:rotate-12 transition-transform duration-500">
              <UserPlus size={32} strokeWidth={2.5} />
           </div>
           <div className="text-center">
              <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Create <span className="text-indigo-400">Your Space</span></h1>
              <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest opacity-70">KnowledgeGraphX Universal Signup</p>
           </div>
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-2xl p-8 lg:p-10 rounded-[40px] shadow-2xl space-y-8 glass relative overflow-hidden">
           <div className="absolute -top-12 -left-12 opacity-5 pointer-events-none text-indigo-500">
              <Brain size={160} />
           </div>

           {/* Social Auth */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 gap-3 group"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                   <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.3 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.12c-.22-.68-.35-1.41-.35-2.12s.13-1.44.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                   </svg>
                </div>
                <span className="font-bold">Google Auth</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 gap-3 group px-4"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                   <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                   </svg>
                </div>
                <span className="font-bold">GitHub Auth</span>
              </Button>
           </div>

           <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase font-extrabold text-zinc-600 tracking-widest">or neural link</span>
              <div className="h-[1px] flex-1 bg-zinc-800" />
           </div>

           {/* Form Layout */}
           <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Full Name</label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-zinc-950/60 border-zinc-800 font-medium h-12" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Work Email</label>
                    <Input 
                      type="email" 
                      placeholder="jane@org.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zinc-950/60 border-zinc-800 font-medium h-12" 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Secret Password</label>
                 <Input 
                   type="password" 
                   placeholder="Create a strong key" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="bg-zinc-950/60 border-zinc-800 font-medium h-12" 
                 />
              </div>

              <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
                 <ShieldCheck size={18} className="text-indigo-400 shrink-0" />
                 <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">By creating your space, you agree to our <Link href="#" className="underline hover:text-indigo-400">Neural Privacy Protocol</Link> and data handling guidelines.</p>
              </div>

              <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold shadow-2xl shadow-indigo-500/20 mt-2 gap-3 group relative overflow-hidden active:scale-95 transition-all">
                <span className="relative z-10 text-lg uppercase tracking-tight">Sync Space Access</span>
                <Sparkles size={20} className="relative z-10 group-hover:scale-125 transition-transform duration-500 text-white" />
              </Button>
           </div>

           <p className="text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
              Already have Access? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">SignIn instead</Link>
           </p>
        </Card>

        <div className="mt-12 text-center text-[10px] text-zinc-800 font-extrabold uppercase tracking-[0.3em]">
           Designed by Antigravity AI © 2026
        </div>
      </div>
    </div>
  );
}
