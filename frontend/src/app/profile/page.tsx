"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  User, 
  Users,
  Mail, 
  Shield, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Clock, 
  Key,
  Database,
  Fingerprint
} from "lucide-react";
import { sessionApi } from "@/api/session";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [sessionCount, setSessionCount] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const mySessions = await sessionApi.getMySessions();
        setSessionCount(mySessions.length);
      } catch (e) {
        console.error("Failed to fetch profile stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <Navbar />
        
        <div className="flex flex-1 overflow-hidden relative text-zinc-100">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 custom-scrollbar no-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold tracking-tight">Access <span className="text-indigo-400">Profile</span></h1>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed uppercase tracking-widest opacity-70">
                    Neural Authorization Identity v2.4.0
                  </p>
                </div>
                <Button 
                  onClick={logout}
                  variant="outline" 
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 rounded-2xl h-12 px-6 gap-2 font-bold transition-all shadow-lg shadow-red-500/5 group"
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Terminate Session</span>
                </Button>
              </div>

              {/* Main Profile Card */}
              <Card className="p-8 md:p-12 rounded-[40px] bg-zinc-900/40 border-zinc-800/60 backdrop-blur-2xl glass relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[80px] -z-10 rounded-full -translate-x-1/2 translate-y-1/2" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  {/* Avatar */}
                  <div className="shrink-0 relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-1 shadow-2xl shadow-indigo-500/20 group-hover:rotate-3 transition-transform duration-500">
                      <div className="w-full h-full rounded-[28px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={64} className="text-zinc-700" />
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-indigo-400 cursor-pointer hover:bg-zinc-800 hover:scale-110 transition-all">
                      <Settings size={18} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-6 self-center">
                    <div>
                      <h2 className="text-3xl font-extrabold text-zinc-100 mb-1">{user?.name || "Anonymous User"}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none">
                          <Fingerprint size={10} />
                          Operator
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none">
                          Active Sync
                        </span>
                        {user?.provider && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700/50 rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none capitalize">
                            {user.provider} Linked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/60">
                      <div className="flex items-center gap-3 text-zinc-400 group">
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-indigo-500/30 transition-colors">
                          <Mail size={18} className="text-zinc-500 group-hover:text-indigo-400" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Primary Sync Mail</p>
                          <p className="text-sm font-medium text-zinc-200 truncate">{user?.email || "No email linked"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400 group">
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-indigo-500/30 transition-colors">
                          <Shield size={18} className="text-zinc-500 group-hover:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Security Clearance</p>
                          <p className="text-sm font-medium text-zinc-200">Level 4 Operator</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sub Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                {/* Security Status */}
                <Card className="p-8 rounded-[40px] bg-zinc-900/40 border-zinc-800/60 glass space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <Key size={20} />
                    </div>
                    <h3 className="text-xl font-extrabold">Security <span className="text-amber-500">Core</span></h3>
                  </div>
                  <div className="space-y-4">
                    <SecurityItem icon={Clock} label="Last Uplink Sync" value="Just now" />
                    <SecurityItem icon={Users} label="Workspaces Activated" value={`${sessionCount} Neural Nets`} />
                    <SecurityItem icon={ExternalLink} label="Linked Provider" value={user?.provider || "Local Auth"} />
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-zinc-800 text-zinc-400 hover:text-white font-bold gap-2">
                      Manage Neural Keys
                    </Button>
                  </div>
                </Card>

                {/* Account Settings Shortcut */}
                <Card className="p-8 rounded-[40px] bg-zinc-900/40 border-zinc-800/60 glass space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                        <Settings size={20} />
                      </div>
                      <h3 className="text-xl font-extrabold">Control <span className="text-indigo-400">Node</span></h3>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                      Configure your global neural settings, synchronization intervals, and data retention policies for KnowledgeGraphX.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-6">
                    <Button variant="outline" className="rounded-2xl border-zinc-800 h-14 font-bold text-zinc-300">Preferences</Button>
                    <Button className="rounded-2xl bg-indigo-600 h-14 font-bold shadow-indigo-500/10 shadow-lg">Edit ID</Button>
                  </div>
                </Card>
              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SecurityItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl bg-zinc-950/40 border border-zinc-800/40 group hover:border-indigo-500/10 transition-all">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-extrabold text-zinc-300">{value}</span>
    </div>
  );
}
