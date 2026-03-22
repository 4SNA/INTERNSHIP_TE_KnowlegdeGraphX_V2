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

export function InteractiveGraph() {
  const [activeNode, setActiveNode] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);

  const nodes: Node[] = [
    { id: "1", label: "Project Manifesto", type: "document", x: 200, y: 150, connections: ["2", "3", "5"] },
    { id: "2", label: "Scalability", type: "concept", x: 400, y: 100, connections: ["1", "4"] },
    { id: "3", label: "Neural Acceleration", type: "concept", x: 350, y: 250, connections: ["1", "6"] },
    { id: "4", label: "Q1 Market Strategy", type: "document", x: 600, y: 120, connections: ["2", "5"] },
    { id: "5", label: "User Feedback", type: "document", x: 500, y: 300, connections: ["1", "4", "6"] },
    { id: "6", label: "R&D Cycle", type: "concept", x: 150, y: 350, connections: ["3", "5"] },
  ];

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 border border-zinc-900 rounded-[40px] overflow-hidden group/graph select-none shadow-2xl glass overscroll-none">
      
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
                    x1={node.x * zoom + (300 * (1 - zoom))}
                    y1={node.y * zoom + (200 * (1 - zoom))}
                    x2={target.x * zoom + (300 * (1 - zoom))}
                    y2={target.y * zoom + (200 * (1 - zoom))}
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
        {nodes.map(node => (
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
                "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                node.type === "document" 
                  ? "bg-zinc-900 border-zinc-800 text-indigo-400 group-hover:border-indigo-500/50" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
                activeNode === node.id && "border-indigo-500 shadow-2xl shadow-indigo-500/20 bg-zinc-900"
              )}>
                 {node.type === "document" ? <Network size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                activeNode === node.id 
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-lg" 
                  : "bg-zinc-950 border-zinc-900 text-zinc-500"
              )}>
                 {node.label}
              </div>
           </div>
        ))}
      </div>

      {/* Graph Toolbar */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 p-2 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl backdrop-blur-xl transition-all group-hover/graph:translate-x-0 translate-x-10 translate-y-0 opacity-0 group-hover/graph:opacity-100">
         <button onClick={() => handleZoom(0.1)} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomIn size={18} /></button>
         <button onClick={() => handleZoom(-0.1)} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomOut size={18} /></button>
         <div className="h-[1px] w-full bg-zinc-800" />
         <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><Maximize2 size={18} /></button>
         <button className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><Share2 size={18} /></button>
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
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
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
