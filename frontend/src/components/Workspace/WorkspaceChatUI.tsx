import * as React from "react";
import { cn } from "@/lib/utils";
import { Send, FileText, Sparkles, Copy, ThumbsUp, ChevronRight, SendHorizontal, BrainCircuit, ExternalLink } from "lucide-react";
import { Button } from "../Button";

interface Citation {
  id: string;
  source: string;
  page: number;
  highlightedText: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export function WorkspaceChatUI() {
  const [messages, setMessages] = React.useState<Message[]>([
    { 
      id: "1", 
      role: "assistant", 
      content: "Hello collaborators! I've analyzed your uploaded documents for this session. How can I assist with your workspace objectives today?",
      timestamp: "10:00 AM"
    },
    {
      id: "2",
      role: "assistant",
      content: "Based on the Market_Analysis_Q1.pdf, our competitive edge is driven by our R&D cycle which is 20% faster than industry standard.",
      citations: [
        { id: "c1", source: "Market_Analysis_Q1.pdf", page: 4, highlightedText: "R&D efficiency is up to 20% faster..." }
      ],
      timestamp: "10:05 AM"
    }
  ]);
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, userMsg]);
    setInput("");
    setIsThinking(true);
    
    // Simulate AI response
    setTimeout(() => {
        setIsThinking(false);
        const aiMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
          content: "I've cross-referenced that with the Manifesto. The key takeaway is our focus on scalability.",
          citations: [
            { id: "c2", source: "Project_Manifesto_v2.pdf", page: 12, highlightedText: "The core architecture is horizontally scalable..." }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        setMessages(prev => [...prev, aiMsg]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800/80 rounded-[40px] shadow-2xl overflow-hidden glass">
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-10 scroll-smooth custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={cn(
            "flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-500",
            m.role === "user" ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%] lg:max-w-[75%]",
              m.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all selection:bg-indigo-500/20",
                m.role === "user" 
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/10" 
                  : "bg-zinc-900/80 border border-zinc-800 text-zinc-200"
              )}>
                {m.content}
                
                {m.citations && (
                   <div className="mt-4 flex flex-wrap gap-2">
                     {m.citations.map(c => (
                        <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 group/cite cursor-pointer hover:bg-indigo-500/20 transition-all border-dashed">
                           <FileText size={10} />
                           <span className="text-[10px] font-bold uppercase tracking-tighter">
                              {c.source} • P.{c.page}
                           </span>
                           <ExternalLink size={10} className="hover:scale-110 transition-transform" />
                        </div>
                     ))}
                   </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 px-1">
                 <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{m.timestamp}</span>
                 {m.role === "assistant" && (
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-zinc-600 hover:text-indigo-400 transition-colors"><ThumbsUp size={12} /></button>
                      <button className="text-zinc-600 hover:text-indigo-400 transition-colors"><Copy size={12} /></button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
             <div className="bg-zinc-900/40 border border-zinc-800/40 px-5 py-4 rounded-3xl flex items-center gap-3">
                <div className="relative">
                   <div className="w-5 h-5 rounded-md bg-indigo-500 animate-pulse-slow" />
                   <Sparkles size={10} className="absolute -top-1 -right-1 text-indigo-300 animate-spin-slow" />
                </div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Neural Engine processing...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-6 lg:p-10 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
        <div className="max-w-4xl mx-auto shadow-2xl shadow-indigo-500/5 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-[30px] opacity-0 group-focus-within:opacity-100 blur transition-all duration-500" />
          
          <div className="relative flex items-center gap-3 bg-zinc-900 border border-zinc-800 group-focus-within:border-indigo-500/50 transition-all rounded-[30px] pl-6 pr-3 py-3">
             <div className="hidden sm:flex p-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                <BrainCircuit size={20} />
             </div>
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSend()}
               placeholder="Collaborate with KnowledgeGraphX AI..."
               className="flex-1 bg-transparent border-none text-zinc-100 text-sm py-2 focus:outline-none placeholder:text-zinc-700 font-medium"
             />
             <Button 
               size="icon" 
               className="h-12 w-12 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
               onClick={handleSend}
               disabled={!input.trim()}
             >
                <SendHorizontal size={22} className="text-white" />
             </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest">Context Tracking On</span>
           </div>
           <div className="h-1 w-1 bg-zinc-800 rounded-full" />
           <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest hover:text-zinc-500 cursor-help transition-colors">
             View Citation Privacy Policy
           </p>
        </div>
      </div>
    </div>
  );
}
