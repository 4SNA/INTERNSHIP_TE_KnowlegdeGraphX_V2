'use client';

import * as React from "react";
import {
  SendHorizontal, Sparkles, FileText, Bot, User, CornerDownRight,
  Download, Copy, Check, ChevronRight, FileSearch, Brain, Zap,
  FileCode, FileBarChart2, BookOpen, GitCompare, Plus, X, UploadCloud,
  BarChart2 as BarChart2Icon, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { queryApi } from "@/api/query";

import { MarkdownContent } from "./MarkdownContent";


// ── Document Generation Modal ─────────────────────────────────────────────────
const DOC_TYPES = [
  { id: "REPORT", label: "Executive Report", icon: FileBarChart2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
  { id: "SUMMARY", label: "Smart Summary", icon: BookOpen, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20" },
  { id: "NOTES", label: "Research Notes", icon: FileText, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20" },
  { id: "COMPARISON", label: "Comparison", icon: GitCompare, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20" },
  { id: "CODE", label: "Code Generation", icon: FileCode, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20" },
  { id: "CUSTOM", label: "Custom Doc", icon: Sparkles, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20" },
];

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  onGenerated: (content: string, type: string) => void;
}

function GenerateModal({ isOpen, onClose, sessionId, onGenerated }: GenerateModalProps) {
  const [selectedType, setSelectedType] = React.useState("REPORT");
  const [prompt, setPrompt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) { setPrompt(""); setSelectedType("REPORT"); }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    try {
      const result = await queryApi.generateDocument(prompt, sessionId, selectedType as any);
      onGenerated(result.content, selectedType);
      onClose();
    } catch (e) {
      console.error("Document generation failed", e);
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl shadow-indigo-500/10 mx-4 animate-in zoom-in-95 fade-in duration-300">
        <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-t-3xl" />
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Generate Document</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">AI-Powered Creation</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.id}
                onClick={() => setSelectedType(dt.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all",
                  dt.bg, dt.color,
                  selectedType === dt.id ? "ring-2 ring-offset-1 ring-offset-zinc-900 ring-indigo-500 scale-105" : "opacity-70 hover:opacity-100"
                )}
              >
                <dt.icon size={18} />
                <span>{dt.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Describe what to generate</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={`e.g. "Generate a detailed report on student performance data from my uploaded CSV..."`}
              className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 resize-none font-medium"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold gap-2 shadow-lg shadow-indigo-500/20"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate {DOC_TYPES.find(d => d.id === selectedType)?.label}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Generated Document Viewer ─────────────────────────────────────────────────
function GeneratedDocViewer({ content, type, onClose }: { content: string; type: string; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kgx-${type.toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 fade-in duration-300">
        <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-t-3xl shrink-0" />
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <FileText size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100">Generated Document</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{type} · KnowledgeGraphX</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-all">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all">
              <Download size={12} />
              Download .md
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <MarkdownContent content={content} />
        </div>
      </div>
    </div>
  );
}

// ── Main ChatUI Component ─────────────────────────────────────────────────────
export function ChatUI() {
  const { messages, sendMessage, isLoading } = useChat();
  const { user } = useAuth();
  const { activeSession } = useSession();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showGenerateModal, setShowGenerateModal] = React.useState(false);
  const [generatedDoc, setGeneratedDoc] = React.useState<{ content: string; type: string } | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (q: string) => {
    setInput(q);
    textareaRef.current?.focus();
  };

  const handleGenerated = (content: string, type: string) => {
    setGeneratedDoc({ content, type });
  };

  // Drag-and-drop on chat area → inject as query
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData("text/plain");
    if (text) setInput(prev => prev + text);
  };

  // Warm welcome tips
  const isEmpty = messages.length === 0 || (messages.length === 1 && messages[0].id === "welcome");

  return (
    <>
      {/* Document Generation Modals */}
      {activeSession && (
        <GenerateModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          sessionId={activeSession.sessionId}
          onGenerated={handleGenerated}
        />
      )}
      {generatedDoc && (
        <GeneratedDocViewer
          content={generatedDoc.content}
          type={generatedDoc.type}
          onClose={() => setGeneratedDoc(null)}
        />
      )}

      <div
        className={cn(
          "flex flex-col h-full w-full bg-zinc-950/30 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300",
          isDragOver && "border-indigo-500/60 shadow-indigo-500/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-zinc-800/50 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Brain size={16} className="text-indigo-400" />
              </div>
              {isLoading && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse border-2 border-zinc-950" />}
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-200">Neural Intelligence</p>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
                {isLoading ? "Processing..." : "Ready"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSession && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider hover:bg-indigo-500/20 transition-all"
              >
                <Sparkles size={11} />
                Generate
              </button>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-indigo-400">
              <UploadCloud size={48} className="animate-bounce" />
              <p className="font-bold text-sm">Drop text to add to query</p>
            </div>
          </div>
        )}

        {/* Messages Viewport */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth no-scrollbar">

          {/* Empty State */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12 animate-in fade-in duration-700">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
                  <Zap size={28} className="text-indigo-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 border-2 border-zinc-950 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">AI</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-extrabold text-zinc-200">Intelligence Engine Ready</h3>
                <p className="text-xs text-zinc-600 max-w-[240px]">Ask anything — document analysis, general knowledge, coding, or generate a document.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                {[
                  { icon: FileSearch, label: "Analyze Documents", q: "Summarize the key points from my documents" },
                  { icon: FileCode, label: "Write Code", q: "Write a Python data analysis script" },
                  { icon: FileBarChart2, label: "Generate Report", q: "Generate an executive report from my data" },
                  { icon: Lightbulb, label: "Explain Concepts", q: "Explain the main concepts in my knowledge base" },
                ].map(s => (
                  <button
                    key={s.label}
                    onClick={() => handleSuggestion(s.q)}
                    className="flex flex-col items-start gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-left transition-all group"
                  >
                    <s.icon size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((m) => {
            const isOwnMessage = m.role === "user" && (m as any).senderEmail === user?.email;
            const isAi = m.role === "assistant";
            const isOtherUser = m.role === "user" && !isOwnMessage;

            return (
              <div
                key={m.id}
                className={cn(
                  "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500",
                  isOwnMessage ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn("flex gap-3 max-w-[90%]", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                    isOwnMessage
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      : isAi
                        ? "bg-zinc-900 border-zinc-800 text-indigo-500 shadow-lg"
                        : "bg-zinc-800/50 border-zinc-700 text-purple-400"
                  )}>
                    {isAi ? <Bot size={15} /> : <User size={15} />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-2 min-w-0">
                    {isOtherUser && (
                      <span className="block text-[8px] font-black text-purple-500 uppercase tracking-widest mb-1">{(m as any).senderEmail}</span>
                    )}

                    <div className={cn(
                      "rounded-2xl text-sm",
                      isOwnMessage
                        ? "px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 font-medium"
                        : isAi
                          ? "px-5 py-4 bg-zinc-900/80 border border-zinc-800 text-zinc-300 shadow-sm"
                          : "px-4 py-3 bg-zinc-800/40 border border-zinc-700/50 text-zinc-400 italic"
                    )}>
                      {isAi
                        ? <MarkdownContent content={m.content} />
                        : <span>{m.content}</span>
                      }
                    </div>

                    {/* Sources */}
                    {isAi && (m as any).sources && (m as any).sources.length > 0 && (
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-950/50 border border-indigo-500/10 animate-in fade-in duration-700">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CornerDownRight size={11} className="text-indigo-500" />
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Evidence Sources</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(m as any).sources.map((src: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 uppercase tracking-wider hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default">
                              <Sparkles size={9} className="text-zinc-600" />
                              {src}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Queries */}
                    {isAi && (m as any).suggestedQueries && (m as any).suggestedQueries.length > 0 && (
                      <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-700">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                          <ChevronRight size={10} />
                          Follow-up suggestions
                        </span>
                        <div className="flex flex-col gap-1">
                          {(m as any).suggestedQueries.map((q: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestion(q)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-xs text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group"
                            >
                              <Sparkles size={10} className="text-zinc-700 group-hover:text-indigo-400 shrink-0 transition-colors" />
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Thinking Loader */}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-500 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                  <Bot size={15} className="relative z-10" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur shadow flex items-center gap-4">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white">Neural Reasoning</p>
                    <p className="text-[9px] font-bold text-zinc-600 italic">Synthesizing knowledge...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Terminal */}
        <div className="shrink-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent border-t border-zinc-900/40">
          <div className="relative group/input">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
            <div className="relative flex items-end gap-3 bg-zinc-950 border border-zinc-800 group-focus-within/input:border-indigo-500/50 transition-all rounded-2xl px-4 py-3 shadow-xl">
              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 bg-transparent border-none text-zinc-200 text-sm focus:outline-none placeholder:text-zinc-700 font-medium resize-none leading-relaxed max-h-[120px] min-h-[24px]"
                placeholder={isLoading ? "Neural engine processing..." : "Ask anything · Shift+Enter for new line"}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <div className="flex items-center gap-2 pb-0.5 shrink-0">
                <div className="h-4 w-[1px] bg-zinc-800" />
                <Button
                  size="icon"
                  className={cn(
                    "shrink-0 h-9 w-9 text-white rounded-xl shadow-lg transition-all active:scale-95 relative overflow-hidden",
                    isLoading || !input.trim()
                      ? "bg-zinc-800 cursor-not-allowed opacity-50"
                      : "bg-indigo-500 hover:bg-indigo-400 hover:shadow-indigo-500/30"
                  )}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <SendHorizontal size={16} className="relative z-10" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-3">
            <p className="text-[9px] text-zinc-700 font-extrabold uppercase tracking-widest flex items-center gap-1">
              <BarChart2Icon size={9} /> Precision RAG Core v3.0
            </p>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <p className="text-[9px] text-zinc-700 font-extrabold uppercase tracking-widest">End-to-End Encrypted</p>
            {activeSession && (
              <>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <p className="text-[9px] text-zinc-700 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Session #{activeSession.sessionCode}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
