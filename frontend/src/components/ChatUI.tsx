import * as React from "react";
import { Send, Plus, Search, Sparkles, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function ChatUI() {
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hello! I am KnowledgeGraphX AI. Ask me anything about your documents." }
  ]);
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // TODO: Add AI generation simulator
    setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: "Based on your documents, there are a few key insights I can provide..." }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden glass">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex w-full",
            m.role === "user" ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
              m.role === "user" 
                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 selection:bg-indigo-400/30" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-300"
            )}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gradient-to-t from-zinc-950/80 to-transparent">
        <div className="relative flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 focus-within:border-indigo-500/50 transition-all rounded-2xl px-4 py-2 shadow-sm focus-within:shadow-xl focus-within:shadow-indigo-500/5">
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-zinc-100 text-sm py-2 focus:outline-none placeholder:text-zinc-600"
            placeholder="Ask anything about your knowledge..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" className="shrink-0 h-9 w-9 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-lg transition-transform active:scale-95" onClick={handleSend}>
            <SendHorizontal size={18} />
          </Button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-3 text-center opacity-70">
          Powered by knowledge retrieval and GenAI RAG Pipeline
        </p>
      </div>
    </div>
  );
}
