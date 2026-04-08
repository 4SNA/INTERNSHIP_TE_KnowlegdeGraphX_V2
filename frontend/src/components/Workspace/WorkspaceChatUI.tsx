import * as React from "react";
import { cn } from "@/lib/utils";
import {
  SendHorizontal, Sparkles, Copy, ThumbsUp, BrainCircuit,
  ExternalLink, FileText, ChevronRight, Check, Bot, Download
} from "lucide-react";
import { Button } from "../Button";
import { useChat } from "@/context/ChatContext";
import { useSession } from "@/context/SessionContext";
import { useAuth } from "@/context/AuthContext";
import { queryApi } from "@/api/query";

import { MarkdownContent } from "../MarkdownContent";


// ── WorkspaceChatUI ───────────────────────────────────────────────────────────
export function WorkspaceChatUI() {
  const { messages, isLoading: isThinking, sendMessage } = useChat();
  const { activeSession } = useSession();
  const { user } = useAuth();
  const [input, setInput] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showGenPanel, setShowGenPanel] = React.useState(false);
  const [genPrompt, setGenPrompt] = React.useState("");
  const [genType, setGenType] = React.useState("REPORT");
  const [generating, setGenerating] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !activeSession || isThinking) return;
    const currentInput = input;
    setInput("");
    try { await sendMessage(currentInput); } catch (e) { console.error(e); setInput(currentInput); }
  };

  const handleSuggestion = (q: string) => {
    setInput(q);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim() || !activeSession || generating) return;
    setGenerating(true);
    try {
      const result = await queryApi.generateDocument(genPrompt, activeSession.sessionId, genType as any);
      setGeneratedContent(result.content);
    } catch (e) { console.error(e); } finally { setGenerating(false); }
  };

  const downloadMd = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kgx-${genType.toLowerCase()}-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const GEN_TYPES = ["REPORT", "SUMMARY", "NOTES", "COMPARISON", "CODE", "CUSTOM"];

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800/80 rounded-[40px] shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-7 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Bot size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-zinc-200">Neural Intelligence</p>
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{isThinking ? "Processing..." : `${messages.length} messages in session`}</p>
          </div>
        </div>
        {activeSession && (
          <button
            onClick={() => setShowGenPanel(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border",
              showGenPanel
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/30"
            )}
          >
            <Sparkles size={11} />
            Generate Doc
          </button>
        )}
      </div>

      {/* Generation Panel */}
      {showGenPanel && !generatedContent && (
        <div className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/40 p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-1.5">
            {GEN_TYPES.map(t => (
              <button key={t} onClick={() => setGenType(t)} className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border", genType === t ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-300")}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={genPrompt} onChange={e => setGenPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGenerate()} placeholder="Describe what to generate..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 font-medium" />
            <button onClick={handleGenerate} disabled={!genPrompt.trim() || generating} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-2">
              {generating ? <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />Generating...</> : <><Sparkles size={13} />Generate</>}
            </button>
          </div>
        </div>
      )}

      {/* Generated Content Viewer */}
      {generatedContent && (
        <div className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/60 max-h-[45%] flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/50 shrink-0">
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><FileText size={11} />Generated {genType}</span>
            <div className="flex gap-2">
              <button onClick={() => copyText(generatedContent, "gen")} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 transition-all">
                {copied === "gen" ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                {copied === "gen" ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadMd} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition-all"><Download size={10} />.md</button>
              <button onClick={() => { setGeneratedContent(null); setGenPrompt(""); }} className="text-zinc-600 hover:text-white transition-colors text-xs px-2">✕</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
            <MarkdownContent content={generatedContent} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 lg:p-7 space-y-8 scroll-smooth no-scrollbar">
        {messages.map((m) => {
          const isOwn = m.role === "user" && (m as any).senderEmail === user?.email;
          const isAi = m.role === "assistant";
          return (
            <div key={m.id} className={cn("flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-500", isOwn ? "justify-end" : "justify-start")}>
              <div className={cn("flex flex-col gap-2 max-w-[85%] lg:max-w-[75%]", isOwn ? "items-end" : "items-start")}>
                {(m as any).senderEmail && !isOwn && (
                  <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">{(m as any).senderEmail}</span>
                )}
                <div className={cn(
                  "px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all",
                  isOwn ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                    : "bg-zinc-900/80 border border-zinc-800 text-zinc-200"
                )}>
                  {isAi ? <MarkdownContent content={m.content} /> : <span>{m.content}</span>}

                  {(m as any).sources && (m as any).sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(m as any).sources.map((src: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[9px] font-bold uppercase tracking-tighter border-dashed">
                          <FileText size={9} />{src}<ExternalLink size={9} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Queries */}
                {isAi && (m as any).suggestedQueries && (m as any).suggestedQueries.length > 0 && (
                  <div className="flex flex-col gap-1 w-full animate-in fade-in duration-700">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><ChevronRight size={9} />Follow-up</span>
                    {(m as any).suggestedQueries.map((q: string, idx: number) => (
                      <button key={idx} onClick={() => handleSuggestion(q)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-xs text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group/sq">
                        <Sparkles size={9} className="text-zinc-700 group-hover/sq:text-indigo-400 shrink-0 transition-colors" />{q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 px-1">
                  <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isAi && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyText(m.content, m.id)} className="text-zinc-700 hover:text-indigo-400 transition-colors">
                        {copied === m.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="bg-zinc-900/40 border border-zinc-800/40 px-5 py-4 rounded-3xl flex items-center gap-4">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Neural Engine processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 p-5 lg:p-7 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
        <div className="max-w-4xl mx-auto shadow-2xl shadow-indigo-500/5 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-500" />
          <div className="relative flex items-end gap-3 bg-zinc-900 border border-zinc-800 group-focus-within:border-indigo-500/50 transition-all rounded-3xl pl-5 pr-3 py-3">
            <div className="hidden sm:flex p-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-600 group-focus-within:text-indigo-400 transition-colors mb-0.5 shrink-0">
              <BrainCircuit size={18} />
            </div>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isThinking ? "Neural Engine processing..." : "Collaborate with KnowledgeGraphX AI · Shift+Enter for new line"}
              disabled={isThinking}
              className="flex-1 bg-transparent border-none text-zinc-100 text-sm py-1 focus:outline-none placeholder:text-zinc-700 font-medium resize-none leading-relaxed max-h-[100px]"
            />
            <Button
              size="icon"
              className="h-11 w-11 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-0.5 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
            >
              <SendHorizontal size={20} className="text-white" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-widest">Context Sync Active</span>
          </div>
          <div className="h-1 w-1 bg-zinc-800 rounded-full" />
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Precision RAG Core v3.0</p>
        </div>
      </div>
    </div>
  );
}
