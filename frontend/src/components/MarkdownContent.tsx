'use client';

import * as React from "react";
import { Copy, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * KnowledgeGraphX Premium Markdown Renderer
 * Supports: Headings, Bold, Italic, Lists, Code Blocks, Inline Code, Horizontal Rules, and Tables.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const [copiedBlock, setCopiedBlock] = React.useState<number | null>(null);

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(idx);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);
  let codeBlockIdx = 0;

  return (
    <div className={cn("markdown-body space-y-1 text-sm leading-relaxed", className)}>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match?.[1] || "text";
          const code = match?.[2] || "";
          const idx = codeBlockIdx++;
          return (
            <div key={i} className="my-5 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
              <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/40" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                  <div className="w-2 h-2 rounded-full bg-green-500/40" />
                  <span className="ml-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{lang}</span>
                </div>
                <button
                  onClick={() => copyCode(code, idx)}
                  className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
                >
                  {copiedBlock === idx ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copiedBlock === idx ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto p-5 text-xs text-indigo-300/90 font-mono leading-7 custom-scrollbar">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return <InlineMarkdown key={i} text={part} />;
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-black text-white mt-6 mb-2 flex items-center gap-2">{formatInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-black text-white mt-8 mb-4 pb-2 border-b border-zinc-800/50">{formatInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-2xl font-black text-white mt-10 mb-5">{formatInline(line.slice(2))}</h1>);
    }
    // Horizontal rule
    else if (line.startsWith("---") || line.startsWith("***")) {
      elements.push(<hr key={i} className="my-6 border-zinc-800/60" />);
    }
    // Table (simple)
    else if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={`table-${i}`} lines={tableLines} />);
      continue;
    }
    // Lists
    else if (line.match(/^[-*+] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push(lines[i].replace(/^[-*+] /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 pl-1">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start gap-3 text-zinc-300">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <span className="font-medium">{formatInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 pl-1">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start gap-3 text-zinc-300">
              <span className="mt-0.5 text-[11px] font-black text-indigo-400 w-5 shrink-0 uppercase tracking-tighter">{idx + 1}.</span>
              <span className="font-medium">{formatInline(it)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="my-4 pl-4 border-l-4 border-indigo-500/30 py-1 italic text-zinc-400 bg-indigo-500/5 rounded-r-xl">
          {formatInline(line.slice(2))}
        </blockquote>
      );
    }
    // Normal paragraph
    else if (line.trim() !== "") {
      elements.push(
        <p key={i} className="text-zinc-300 mb-3 leading-relaxed font-medium">{formatInline(line)}</p>
      );
    } else {
      elements.push(<div key={`br-${i}`} className="h-2" />);
    }

    i++;
  }

  return <>{elements}</>;
}

function formatInline(text: string): React.ReactNode {
  // Matches: `code`, **bold**, *italic*, __bold__, _italic_
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`")) {
          return <code key={i} className="px-1.5 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-300 font-mono text-[11px] font-black">{p.slice(1, -1)}</code>;
        }
        if ((p.startsWith("**") && p.endsWith("**")) || (p.startsWith("__") && p.endsWith("__"))) {
          return <strong key={i} className="font-black text-white">{p.slice(2, -2)}</strong>;
        }
        if ((p.startsWith("*") && p.endsWith("*")) || (p.startsWith("_") && p.endsWith("_"))) {
          return <em key={i} className="italic text-zinc-400">{p.slice(1, -1)}</em>;
        }
        return p;
      })}
    </>
  );
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const rows = lines.map(l =>
    l.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
  );
  if (rows.length < 2) return null;
  const header = rows[0];
  const body = rows.filter((_, i) => i !== 1).slice(1);

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-zinc-800 shadow-xl">
      <table className="w-full text-xs text-left border-collapse bg-zinc-950/20">
        <thead className="bg-zinc-900/60 font-black text-indigo-400 uppercase tracking-widest border-b border-zinc-800">
          <tr>
            {header.map((h, i) => <th key={i} className="px-5 py-3.5">{formatInline(h)}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900/50">
          {body.map((row, ri) => (
            <tr key={ri} className="hover:bg-zinc-900/30 transition-colors">
              {row.map((cell, ci) => <td key={ci} className="px-5 py-3.5 text-zinc-300 font-medium">{formatInline(cell)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
