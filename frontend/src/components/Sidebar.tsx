"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  FileText, 
  Network, 
  Users, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ icon: Icon, label, href, active, collapsed }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "w-full h-11 px-3 rounded-xl flex items-center transition-all cursor-pointer group mb-1.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        active 
          ? "bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 font-bold" 
          : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent"
      )}
      title={collapsed ? label : undefined}
    >
      <div className={cn("transition-colors flex-shrink-0", collapsed ? "mx-auto" : "mr-3", active ? "text-indigo-400" : "group-hover:text-white")}>
        <Icon size={20} />
      </div>
      {!collapsed && (
        <span className="text-sm tracking-tight truncate">{label}</span>
      )}
      {!collapsed && active && (
        <div className="ml-auto w-1 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
      )}
    </Link>
  );
}

import { useSession } from "@/context/SessionContext";
import { Plus, Hash, LogOut } from "lucide-react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [joinCode, setJoinCode] = React.useState("");
  const pathname = usePathname();
  const { activeSession, createSession, joinSession, loading, clearSession } = useSession();

  const handleCreate = async () => {
    try {
      await createSession();
    } catch (e) {
      alert("Failed to create workspace");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    try {
      await joinSession(joinCode);
      setJoinCode("");
    } catch (e) {
      alert("Invalid Workspace Code");
    }
  };

  const menuItems = [
    { icon: BarChart3, label: "Command Center", href: "/" },
    { icon: FileText, label: "Knowledge Base", href: "/documents" },
    { icon: Network, label: "Neural Graph", href: "/graph" },
    { icon: History, label: "Intelligence log", href: "/history" },
  ];

  return (
    <aside 
      className={cn(
        "h-[calc(100vh-64px)] shrink-0 border-r border-zinc-900/40 bg-zinc-950/40 backdrop-blur-md hidden lg:flex flex-col p-4 sticky top-16 z-40 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
      aria-label="Main Navigation"
    >
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        {/* Navigation Section */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
              collapsed={isCollapsed}
            />
          ))}
        </div>

        {/* Workspace Management Section */}
        {!isCollapsed && (
          <div className="space-y-4 px-1">
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-2">Workspaces</h3>
            
            <button 
              onClick={handleCreate}
              disabled={loading}
              className="w-full h-10 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs hover:bg-indigo-500/20 transition-all flex items-center gap-2 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              <span>New Workspace</span>
            </button>

            <form onSubmit={handleJoin} className="relative group/join">
              <input 
                type="text"
                placeholder="Join by code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs font-medium text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/join:text-indigo-500 transition-colors" />
            </form>

            {/* Active Session Indicator */}
            {activeSession && (
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider">Live Workspace</span>
                  <button onClick={clearSession} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <LogOut size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-slow" />
                  <code className="text-sm font-bold text-indigo-400 tracking-wider">#{activeSession.sessionCode}</code>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase">
                  <Users size={12} />
                  <span>Interactive Sync</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 space-y-2 border-t border-zinc-900/60">
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          href="/settings" 
          active={pathname === "/settings"} 
          collapsed={isCollapsed} 
        />
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-11 px-3 rounded-xl flex items-center text-zinc-600 hover:text-white hover:bg-zinc-900 transition-all border border-transparent group"
          aria-expanded={!isCollapsed}
        >
          <div className={cn("flex-shrink-0 transition-colors", isCollapsed ? "mx-auto rotate-180" : "mr-3", "group-hover:text-white")}>
            <ChevronLeft size={20} />
          </div>
          {!isCollapsed && <span className="text-sm font-medium">Minimize Workspace</span>}
        </button>
      </div>
    </aside>
  );
}
