"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { Brain, Chrome, Github, ArrowRight, Sparkles } from "lucide-react";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.loginSuccess({ email, password });
      login(data.token, data.user);
      router.push('/');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[140px] -z-10 rounded-full animate-pulse-slow" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] -z-10 rounded-full translate-x-1/4 -translate-y-1/4" />
      
      <div className="w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8 gap-4">
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 group cursor-pointer hover:rotate-12 transition-transform duration-500">
              <Brain size={32} strokeWidth={2.5} />
           </div>
           <div className="text-center">
              <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Welcome <span className="text-indigo-400">Back</span></h1>
              <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest opacity-70">KnowledgeGraphX Neural Auth</p>
           </div>
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl space-y-8 glass relative">
           <div className="absolute top-4 right-4 text-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles size={24} />
           </div>

           {/* Social Auth */}
           <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-2xl border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 gap-3 group"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                   <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.3 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.12c-.22-.68-.35-1.41-.35-2.12s.13-1.44.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                   </svg>
                </div>
                <span className="font-bold">Continue with Google</span>
              </Button>
           </div>

           <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase font-extrabold text-zinc-600 tracking-widest">or email</span>
              <div className="h-[1px] flex-1 bg-zinc-800" />
           </div>

           {/* Form */}
           <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Email Address</label>
                 <Input 
                   type="email" 
                   placeholder="name@company.com" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="bg-zinc-950/60 border-zinc-800 focus:ring-indigo-500/30 font-medium" 
                 />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Password</label>
                    <button type="button" className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase">Forgot?</button>
                 </div>
                 <Input 
                   type="password" 
                   placeholder="••••••••" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="bg-zinc-950/60 border-zinc-800 focus:ring-indigo-500/30 font-medium" 
                 />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold shadow-xl shadow-indigo-500/10 mt-2 gap-2 group overflow-hidden"
              >
                <span className="relative z-10">{isLoading ? "Verifying..." : "Sign in to Space"}</span>
                {!isLoading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 px-0.5 transition-transform" />}
                <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-500" />
              </Button>
           </form>

           <p className="text-center text-xs font-bold text-zinc-600 uppercase tracking-widest pt-4">
              No access yet? <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">Join the Waitlist</Link>
           </p>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
           <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] animate-pulse">Neural Authorization Protocol v2.4.0</p>
           <div className="flex items-center justify-center gap-6">
              <Link href="#" className="text-[9px] font-bold text-zinc-800 hover:text-zinc-500 transition-colors uppercase tracking-widest">Status</Link>
              <Link href="#" className="text-[9px] font-bold text-zinc-800 hover:text-zinc-500 transition-colors uppercase tracking-widest">Privacy</Link>
              <Link href="#" className="text-[9px] font-bold text-zinc-800 hover:text-zinc-500 transition-colors uppercase tracking-widest">Terms</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
