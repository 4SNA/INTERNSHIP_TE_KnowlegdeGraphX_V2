"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "./Button";
import { Brain, Search, Plus, UserCircle, Users, Menu, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { NewInsightModal } from "./NewInsightModal";
import { useRouter } from "next/navigation";
import { usePopover } from "@/context/PopoverContext";
import { AlertTriangle } from "lucide-react";

export function Navbar() {
  const { user } = useAuth();
  const { activeSession, terminateActiveSession } = useSession();
  const { openPopover, closePopover } = usePopover();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const handleTerminate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    openPopover({
      anchor: "terminate",
      title: "Confirm Neural Purge?",
      description: "Executing this protocol will irreversibly destroy the active workspace and all associated semantic vectors.",
      icon: <AlertTriangle size={24} className="text-rose-500" />,
      action: async () => {
        try {
          await terminateActiveSession();
          closePopover();
          router.push("/workspaces");
        } catch (error) {
          console.error("Neural termination failed:", error);
        }
      }
    });
  };

  const triggerComingSoon = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <nav className="h-16 w-full border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-lg sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900/90 border border-indigo-500/30 backdrop-blur-md rounded-2xl shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
               <Users size={16} />
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-white tracking-tight">Collaboration Engine</span>
               <span className="text-[10px] font-medium text-zinc-400">Neural Sync is currently in development.</span>
            </div>
            <div className="ml-4 pl-4 border-l border-white/5">
               <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest animate-pulse">Coming Soon</span>
            </div>
          </div>
        </div>
      )}

      {/* BRAND SECTION */}
      <Link href="/" className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
          <Brain size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
          Knowledge<span className="text-indigo-400 font-extrabold tracking-tighter">GraphX</span>
        </span>
      </Link>

      {/* SEARCH BAR (DESKTOP) */}
      <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:flex relative group">
        <label htmlFor="nav-search" className="sr-only">Search knowledge</label>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
          <Search size={18} />
        </div>
        <input
          id="nav-search"
          type="text"
          placeholder="Search knowledge..."
          className="w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-zinc-900 transition-all outline-none"
        />
      </div>

      {/* ACTION SECTION */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* MOBILE SEARCH TRIGGER */}
        <Button variant="ghost" size="icon" className="md:hidden text-zinc-400" aria-label="Search">
           <Search size={20} />
        </Button>

        <div className="hidden sm:flex items-center gap-3">
          {activeSession ? (
            <div className="flex items-center gap-1">
              <Link href={`/session/${activeSession?.sessionCode}`} className="block group"> {/* Added null-safe operator */}
                <div className="flex items-center gap-1.5 p-1 pr-4 bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Users size={16} />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest leading-none">Active Workspace</span>
                      <span className="text-[11px] font-bold text-indigo-100 tracking-tight">#{activeSession?.sessionCode}</span> {/* Added null-safe operator */}
                  </div>
                </div>
              </Link>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleTerminate} 
                  className="w-10 h-10 rounded-xl text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all border border-transparent"
                  title="Terminate Workspace"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={triggerComingSoon}
              variant="outline" size="sm" className="gap-2 border-zinc-800 text-zinc-400 hover:text-white rounded-xl"
            >
              <Users size={16} />
              <span className="hidden lg:inline">Join Session</span>
            </Button>
          )}

          <Button 
            onClick={() => setIsInsightModalOpen(true)}
            size="sm" 
            className="gap-2 rounded-xl shadow-indigo-500/10 shadow-lg"
          >
            <Plus size={16} />
            <span className="hidden lg:inline">New Insight</span>
          </Button>
        </div>

        <Link href="/settings" className="outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full group">
          <div className="flex items-center gap-3 space-x-1">
             <div className="hidden md:flex flex-col items-end">
               <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate max-w-[120px]">
                 {user?.name || "Anonymous"}
               </span>
               <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest leading-none">Operator</span>
             </div>
             <div className="w-10 h-10 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-500 cursor-pointer transition-all overflow-hidden relative shadow-lg shadow-indigo-500/5 ring-0 group-focus-visible:ring-2 ring-indigo-500" title={`Active Profile: ${user?.email}`}>
               {user?.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <UserCircle size={26} />
               )}
               <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>
        </Link>
        

        {/* MOBILE MENU TOGGLE */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-zinc-400" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
           {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      <NewInsightModal 
        isOpen={isInsightModalOpen} 
        onClose={() => setIsInsightModalOpen(false)} 
      />

      {/* MOBILE OVERLAY MENU (Simple implementation) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 lg:hidden glass z-[999]">
           <Button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              triggerComingSoon();
            }}
            variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-zinc-800"
           >
              <Users size={20} />
              <span className="font-bold">Join Active Session</span>
           </Button>

           <Button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsInsightModalOpen(true);
            }}
            className="w-full justify-start gap-3 h-12 rounded-2xl shadow-indigo-500/10 shadow-lg"
           >
              <Plus size={20} />
              <span className="font-bold">Upload New Document</span>
           </Button>
        </div>
      )}
    </nav>
  );
}
