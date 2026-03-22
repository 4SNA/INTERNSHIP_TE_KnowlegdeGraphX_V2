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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/" },
    { icon: Users, label: "My Sessions", href: "/sessions" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: Network, label: "Knowledge Graph", href: "/graph" },
    { icon: History, label: "Query History", href: "/history" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
  ];

  return (
    <aside 
      className={cn(
        "h-[calc(100vh-64px)] shrink-0 border-r border-zinc-900/40 bg-zinc-950/40 backdrop-blur-md hidden lg:flex flex-col p-4 sticky top-16 z-40 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
      aria-label="Main Navigation"
    >
      <div className="flex-1 space-y-1">
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
