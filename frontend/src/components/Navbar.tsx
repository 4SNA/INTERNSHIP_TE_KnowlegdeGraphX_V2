"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "./Button";
import { Brain, Search, Plus, UserCircle, Users, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="h-16 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-lg sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 shadow-sm">
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
          <Button variant="outline" size="sm" className="gap-2 border-zinc-800 text-zinc-400 hover:text-white rounded-xl">
            <Users size={16} />
            <span className="hidden lg:inline">Join Session</span>
          </Button>
          <Button size="sm" className="gap-2 rounded-xl shadow-indigo-500/10 shadow-lg">
            <Plus size={16} />
            <span className="hidden lg:inline">New Insight</span>
          </Button>
        </div>

        <Link href="/profile" className="outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full">
           <div className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer transition-all overflow-hidden" title="View Profile">
             <UserCircle size={24} />
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

      {/* MOBILE OVERLAY MENU (Simple implementation) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 lg:hidden glass z-[999]">
           <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-zinc-800">
              <Users size={20} />
              <span className="font-bold">Join Active Session</span>
           </Button>
           <Button className="w-full justify-start gap-3 h-12 rounded-2xl shadow-indigo-500/10 shadow-lg">
              <Plus size={20} />
              <span className="font-bold">Upload New Document</span>
           </Button>
        </div>
      )}
    </nav>
  );
}
