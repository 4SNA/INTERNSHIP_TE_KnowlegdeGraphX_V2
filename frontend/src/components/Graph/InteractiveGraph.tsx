import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, Network, Share2, ZoomIn, ZoomOut, Maximize2, MousePointer2 } from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";

interface Node {
  id: string;
  label: string;
  type: "document" | "concept" | "query";
  x: number;
  y: number;
  connections: string[];
}

import { useDocuments } from "@/context/DocumentContext";
import { useSession } from "@/context/SessionContext";

interface Node {
  id: string;
  label: string;
  type: "document" | "concept" | "query";
  x: number;
  y: number;
  connections: string[];
}

export function InteractiveGraph() {
  const { documents } = useDocuments();
  const { activeSession } = useSession();
  const [activeNode, setActiveNode] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [showShareToast, setShowShareToast] = React.useState(false);

  // Dynamic layout calculation for nodes
  const nodes: Node[] = React.useMemo(() => {
    if (documents.length === 0) return [];
    
    return documents.map((doc, index) => {
      // Simple circular layout for dynamic nodes
      const angle = (index / documents.length) * 2 * Math.PI;
      const radius = 150;
      return {
        id: doc.id.toString(),
        label: doc.fileName,
        type: "document",
        x: 400 + radius * Math.cos(angle),
        y: 250 + radius * Math.sin(angle),
        connections: documents
          .filter(d => d.id !== doc.id)
          .map(d => d.id.toString())
          .slice(0, 2) // Limit connections for visual clarity
      };
    });
  }, [documents]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  const handleShare = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(`http://localhost:3000/graph?session=${activeSession.sessionCode}`);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 border border-zinc-900 rounded-[40px] overflow-hidden group/graph select-none shadow-2xl glass overscroll-none">
      
      {/* Share Notification Inside Graph */}
      {showShareToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-500">
           <div className="px-5 py-2.5 bg-indigo-600/90 backdrop-blur-md rounded-2xl border border-indigo-400 shadow-xl flex items-center gap-3">
              <Share2 size={14} className="text-white" />
              <span className="text-[10px] font-extrabold text-white uppercase tracking-widest">Workspace Link Copied</span>
           </div>
        </div>
      )}

      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-500 ease-out" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, #3f3f46 1px, transparent 0)', 
          backgroundSize: '40px 40px',
          transform: `scale(${zoom})`
        }} 
      />

      {/* SVG Connections / Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
           <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
           </linearGradient>
           <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                 <feMergeNode in="coloredBlur" />
                 <feMergeNode in="SourceGraphic" />
              </feMerge>
           </filter>
        </defs>
        
        {nodes.map(node => (
           node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target || node.id > targetId) return null;
              
              const isHighlighted = activeNode === node.id || activeNode === targetId;

              return (
                 <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x * zoom + (400 * (1 - zoom))}
                    y1={node.y * zoom + (250 * (1 - zoom))}
                    x2={target.x * zoom + (400 * (1 - zoom))}
                    y2={target.y * zoom + (250 * (1 - zoom))}
                    stroke={isHighlighted ? "#6366f1" : "url(#edgeGradient)"}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    className="transition-all duration-500"
                    opacity={isHighlighted ? 0.8 : 0.4}
                    style={isHighlighted ? { filter: 'url(#glow)' } : {}}
                 />
              );
           })
        ))}
      </svg>

      {/* Nodes */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-700 animate-in fade-in duration-1000">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-2">
                <Network size={28} className="opacity-20" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Awaiting Knowledge Sources</p>
          </div>
        ) : nodes.map(node => (
           <div 
              key={node.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-3",
                activeNode === node.id ? "scale-110 z-50" : "scale-100 hover:scale-105 z-10"
              )}
              style={{ left: node.x, top: node.y }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
           >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-xl",
                node.type === "document" 
                  ? "bg-zinc-900 border-zinc-800 text-indigo-400 group-hover:border-indigo-500/50" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
                activeNode === node.id && "border-indigo-500 shadow-2xl shadow-indigo-500/30 bg-zinc-950"
              )}>
                 {node.type === "document" ? <Network size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                activeNode === node.id 
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-lg" 
                  : "bg-zinc-950 border-zinc-900 text-zinc-400"
              )}>
                 {node.label}
              </div>
           </div>
        ))}
      </div>

      {/* Graph Toolbar */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 p-2 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl backdrop-blur-xl transition-all translate-y-0 shadow-2xl">
         <button onClick={() => handleZoom(0.1)} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomIn size={18} /></button>
         <button onClick={() => handleZoom(-0.1)} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomOut size={18} /></button>
         <div className="h-[1px] w-full bg-zinc-800" />
         <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><Maximize2 size={18} /></button>
         <button onClick={handleShare} className="p-2.5 rounded-xl hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 transition-all"><Share2 size={18} /></button>
      </div>

      {/* Node Info Panel */}
      <div className={cn(
         "absolute bottom-6 left-6 max-w-xs transition-all duration-500 transform",
         activeNode ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}>
         <Card className="bg-zinc-900/80 border-indigo-500/30 backdrop-blur-3xl p-5 rounded-3xl shadow-3xl shadow-indigo-500/10">
            <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mb-2 flex items-center justify-between">
              Selected Connection 
              <MousePointer2 size={12} className="animate-pulse" />
            </h4>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight pr-4 truncate">
              {nodes.find(n => n.id === activeNode)?.label || "No node selected"}
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium mt-2 leading-relaxed">
              This node has <span className="text-zinc-300 font-bold">{nodes.find(n => n.id === activeNode)?.connections.length || 0} active links</span> across the current knowledge corpus.
            </p>
         </Card>
      </div>


      {/* Background blobs */}
      <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full -z-20 animate-pulse-slow" />
    </div>
  );
}
