'use client';

import * as React from "react";
import { SendHorizontal, Sparkles, FileText, Bot, User, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useChat } from "@/context/ChatContext";

export function ChatUI() {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden glass relative">
      {/* Messages Viewport */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth no-scrollbar"
      >
        {messages.map((m) => (
          <div key={m.id} className={cn(
            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500",
            m.role === "user" ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "flex gap-4 max-w-[85%]",
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              {/* Avatar Icon */}
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                m.role === "user" 
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
              )}>
                {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble Body */}
              <div className="space-y-3">
                <div className={cn(
                  "px-5 py-3.5 rounded-2xl text-sm leading-relaxed",
                  m.role === "user" 
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 shadow-lg shadow-indigo-500/5 font-medium" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300"
                )}>
                  {m.content}
                </div>

                {/* Grounding Sources (Citations) */}
                {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in duration-1000">
                    {m.sources.map((src, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default">
                        <FileText size={10} />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* AI "Thinking" state */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-400 flex items-center justify-center animate-pulse">
                <Sparkles size={16} />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/40 text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-3">
                <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                </div>
                Analysing Knowledge Graph...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Terminal */}
      <div className="p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent border-t border-zinc-900/40">
        <div className="relative group/input">
           {/* Decorative dynamic ring */}
           <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
           
           <div className="relative flex items-center gap-3 bg-zinc-950 border border-zinc-800 group-focus-within/input:border-indigo-500/50 transition-all rounded-2xl px-5 py-3.5 shadow-xl">
              <input
                type="text"
                className="flex-1 bg-transparent border-none text-zinc-200 text-sm focus:outline-none placeholder:text-zinc-700 font-medium"
                placeholder={isLoading ? "KnowledgeGraphX is busy thinking..." : "Ask neural intelligence anything..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <div className="flex items-center gap-3">
                 <div className="h-4 w-[1px] bg-zinc-800" />
                 <Button 
                   size="icon" 
                   className={cn(
                     "shrink-0 h-10 w-10 text-white rounded-xl shadow-2xl transition-all active:scale-95 group/btn overflow-hidden relative",
                     isLoading ? "bg-zinc-800 cursor-not-allowed opacity-50" : "bg-indigo-500 hover:bg-indigo-400 hover:shadow-indigo-500/20"
                   )}
                   onClick={handleSend}
                   disabled={isLoading || !input.trim()}
                 >
                   <SendHorizontal size={20} className="relative z-10" />
                   <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                 </Button>
              </div>
           </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
           <p className="text-[9px] text-zinc-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 size={10} /> Precision RAG Core v3.0
           </p>
           <div className="w-1 h-1 rounded-full bg-zinc-800" />
           <p className="text-[9px] text-zinc-600 font-extrabold uppercase tracking-widest">End-to-End Encryption</p>
        </div>
      </div>
    </div>
  );
}

// Support Icons (Mocking to prevent breakages if missing imports)
const BarChart2 = ({ size, className }: any) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);
