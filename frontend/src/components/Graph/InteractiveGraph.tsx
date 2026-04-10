import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Brain, Sparkles, Network, Share2, ZoomIn, ZoomOut, Maximize2, 
  MousePointer2, User, Building2, Lightbulb, Tag, FileText, X,
  ChevronRight, Info
} from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";
import axiosInstance from "@/api";
import { useSession } from "@/context/SessionContext";
import { useWebSocket } from "@/context/WebSocketContext";

interface NeuralNode {
  id: string;
  label: string;
  type: string; // document, people, organization, concept, keyword
  strength: number;
  context?: string;
  x?: number;
  y?: number;
}

interface IntelligenceEdge {
  source: string;
  target: string;
  label: string;
  weight: number;
}

interface KnowledgeNetwork {
  nodes: NeuralNode[];
  edges: IntelligenceEdge[];
}

export function InteractiveGraph() {
  const { activeSession } = useSession();
  const { graphRefreshSignal } = useWebSocket();
  const [network, setNetwork] = React.useState<KnowledgeNetwork>({ nodes: [], edges: [] });
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<NeuralNode | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [viewOffset, setViewOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const [neuralAuditInsights, setNeuralAuditInsights] = React.useState<string[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const fetchGraph = React.useCallback(async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/sessions/${activeSession.sessionId}/graph`);
      const data = response.data;
      
      if (data.nodes.length === 0) {
          setNetwork({ nodes: [], edges: [] });
          return;
      }

      const docNodes = data.nodes.filter((n: any) => n.type === 'document').sort((a: any, b: any) => a.label.localeCompare(b.label));
      
      const docCount = Math.max(1, docNodes.length);
      const r = 280 + (docCount * 25); 
      
      // Calculate initial center based on container size (approx 1000x800)
      const centerX = 500;
      const centerY = 400;

      const docsWithPos = docNodes.map((n: any, i: number) => {
         const angle = (i / docCount) * 2 * Math.PI;
         return { ...n, x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
      });

      const processedNodes = data.nodes.map((node: any) => {
         if (node.type === 'document') {
            return docsWithPos.find((d: any) => d.id === node.id);
         }
         const parentEdge = data.edges.find((e: any) => e.target === node.id && e.source.startsWith('doc_'));
         const parent = parentEdge ? docsWithPos.find((d: any) => d.id === parentEdge.source) : null;
         
         if (parent) {
            const indexInGroup = data.edges.filter((e: any) => e.source === parent.id).findIndex((e: any) => e.target === node.id);
            const totalInGroup = data.edges.filter((e: any) => e.source === parent.id).length;
            const parentAngle = Math.atan2(parent.y - centerY, parent.x - centerX);
            
            const angleSpread = Math.PI / 1.5;
            const angle = parentAngle - (angleSpread / 2) + ((indexInGroup + 0.5) / Math.max(1, totalInGroup)) * angleSpread;
            const dist = 160 + (indexInGroup % 3) * 45; 
            
            return { ...node, x: parent.x + dist * Math.cos(angle), y: parent.y + dist * Math.sin(angle) };
         }
         return { ...node, x: centerX + 400 * Math.cos(Math.random() * 2 * Math.PI), y: centerY + 400 * Math.sin(Math.random() * 2 * Math.PI) };
      });
      
      setNetwork({ ...data, nodes: processedNodes });
    } catch (err) {
      console.error("Neural Graph fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  const resetView = React.useCallback(() => {
    setViewOffset({ x: 0, y: 0 });
    setZoom(1);
    fetchGraph();
  }, [fetchGraph]);

  React.useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Auto-refresh graph when entity extraction completes for any uploaded file
  React.useEffect(() => {
    if (graphRefreshSignal > 0) fetchGraph();
  }, [graphRefreshSignal, fetchGraph]);

  const runNeuralAudit = async () => {
    if (!activeSession || !selectedNode) return;
    setAnalyzing(true);
    try {
      const existingEdges = network.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
      if (selectedNode.type === 'document' && existingEdges.length === 0) {
          const docId = selectedNode.id.split('_')[1];
          await axiosInstance.post(`/api/entities/reindex/${docId}`);
          await fetchGraph(); 
      }

      const res = await axiosInstance.get(`/api/sessions/${activeSession.sessionId}/analyze-path`);
      setNeuralAuditInsights(res.data.insights || ["No anomalies detected in the current neural cluster."]);
    } catch (err) {
      console.error("Neural Audit failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingId) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    }
  };

  const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
    const node = network.nodes.find(n => n.id === id);
    if (node && node.x !== undefined && node.y !== undefined) {
      setOffset({ x: e.clientX / zoom - node.x, y: e.clientY / zoom - node.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      const newX = e.clientX / zoom - offset.x;
      const newY = e.clientY / zoom - offset.y;
      
      setNetwork(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingId ? { ...n, x: newX, y: newY } : n)
      }));
    } else if (isPanning) {
      setViewOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'document': return <FileText size={18} />;
      case 'person': 
      case 'people': return <User size={18} />;
      case 'organization':
      case 'institution': return <Building2 size={18} />;
      case 'skill':
      case 'subject': return <Network size={18} />;
      case 'marks':
      case 'metric': return <Sparkles size={18} />;
      case 'experience': return <Share2 size={18} />;
      case 'identifier': return <Maximize2 size={18} />;
      case 'concept': return <Lightbulb size={18} />;
      case 'topic':
      case 'keyword': return <Tag size={18} />;
      default: return <Brain size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'document': return 'bg-zinc-900 border-zinc-700 text-indigo-400';
      case 'person': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'organization':
      case 'institution': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'skill':
      case 'subject': return 'bg-violet-500/10 border-violet-500/30 text-violet-400';
      case 'marks':
      case 'metric': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'experience': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'identifier': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
    }
  };

  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredNodes = network.nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={cn(
        "relative w-full h-full bg-zinc-950 border border-zinc-900 rounded-[40px] overflow-hidden select-none shadow-2xl glass overscroll-none flex",
        isPanning ? "cursor-grabbing" : "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Graph Area */}
      <div className="relative flex-grow h-full overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-300" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', 
            backgroundSize: '60px 60px',
            transform: `scale(${zoom})`
          }} 
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <g style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})` }} className="transition-transform duration-75">
          <defs>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3f3f46" />
            </marker>
            <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
          
          {network.edges.map((edge, idx) => {
            const source = network.nodes.find(n => n.id === edge.source);
            const target = network.nodes.find(n => n.id === edge.target);
            if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;
            
            const isHighlighted = activeNodeId === source.id || activeNodeId === target.id;
            const isDocBridge = source.type === 'document' && target.type === 'document';
            
            const x1 = source.x;
            const y1 = source.y;
            const x2 = target.x;
            const y2 = target.y;
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const normX = dy / (len || 1);
            const normY = -dx / (len || 1);
            const qX = isDocBridge ? midX : midX + normX * 25; 
            const qY = isDocBridge ? midY : midY + normY * 25;

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={isDocBridge ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} Q ${qX} ${qY} ${x2} ${y2}`}
                  stroke={isDocBridge ? "#6366f1" : (isHighlighted ? "#6366f1" : "#27272a")}
                  strokeWidth={isDocBridge ? 3 : (isHighlighted ? 2 : 0.8)}
                  strokeDasharray={isDocBridge ? "8,4" : "0"}
                  fill="none"
                  markerEnd={isHighlighted || isDocBridge ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                  className={cn("transition-all duration-300", isDocBridge && "animate-pulse")}
                  opacity={isHighlighted || isDocBridge ? 1 : 0.15}
                />
                {(isHighlighted || isDocBridge) && (
                  <text
                    x={qX}
                    y={qY - 10}
                    fill={isDocBridge ? "#818cf8" : "#6366f1"}
                    fontSize={isDocBridge ? "10" : "8"}
                    fontWeight="black"
                    textAnchor="middle"
                    className="drop-shadow-lg uppercase tracking-widest"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
          </g>
        </svg>

        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-75"
          style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})` }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-700 animate-pulse">
               <Brain size={48} className="text-indigo-500 animate-bounce" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Neural Synapses...</p>
            </div>
          ) : filteredNodes.map((node) => (
            <div 
              key={node.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-200",
                draggingId === node.id ? "scale-110 z-[60]" : "scale-100 hover:scale-105 z-10",
                activeNodeId === node.id && "z-50"
              )}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleNodeDragStart(e, node.id)}
              onMouseEnter={() => setActiveNodeId(node.id)}
              onMouseLeave={() => !selectedNode && setActiveNodeId(null)}
              onClick={() => setSelectedNode(node)}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl relative group/node",
                getTypeColor(node.type),
                activeNodeId === node.id && "ring-4 ring-indigo-500/30 border-indigo-400 bg-zinc-950 scale-110",
                node.type === 'document' ? "bg-zinc-900" : "rounded-full"
              )}>
                 {getTypeIcon(node.type)}
              </div>
              <div className={cn(
                "mt-2 px-3 py-1.5 rounded-xl border backdrop-blur-3xl transition-all text-[10px] font-black uppercase tracking-tighter whitespace-nowrap shadow-lg",
                activeNodeId === node.id 
                  ? "bg-indigo-600 text-white border-indigo-500" 
                  : "bg-zinc-900/90 border-zinc-800 text-zinc-300"
              )}>
                 {node.label}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-8 flex items-center gap-3">
           <Card className="flex items-center gap-1 p-1.5 bg-zinc-900/60 border-zinc-800/60 backdrop-blur-2xl rounded-[24px] shadow-2xl">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search neural tokens..."
                className="bg-zinc-950 border border-zinc-800/50 rounded-xl px-4 py-2 text-[10px] font-bold text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 w-44 transition-all"
              />
              <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomIn size={16} /></button>
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomOut size={16} /></button>
           </Card>
           <Button onClick={() => resetView()} variant="ghost" className="bg-zinc-900/60 border-zinc-800/60 backdrop-blur-2xl rounded-[24px] h-12 px-6 text-[10px] uppercase font-black tracking-widest text-zinc-400 hover:text-white transition-all">
              <Maximize2 size={14} className="mr-3 text-indigo-500" /> Auto Layout
           </Button>
        </div>
      </div>

      {/* OVERLAY Info Sidebar (Ensuring z-index for visibility) */}
      <div className={cn(
        "w-96 h-full border-l border-zinc-900 bg-zinc-950/80 backdrop-blur-3xl transition-transform duration-700 ease-in-out p-8 flex flex-col gap-6 z-[100] absolute top-0 right-0",
        selectedNode ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border", selectedNode && getTypeColor(selectedNode.type))}>
                 {selectedNode && getTypeIcon(selectedNode.type)}
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Metadata Discovery</span>
           </div>
           <button 
            onClick={() => setSelectedNode(null)}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all"
           >
              <X size={20} />
           </button>
        </div>

        <div className="space-y-2">
           <h2 className="text-2xl font-black text-white tracking-tighter leading-tight italic">
              {selectedNode?.label}
           </h2>
           <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-tighter">
              Class: {selectedNode?.type}
           </span>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
           <div className="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
              <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                 <Info size={12} /> Detailed Context
              </h5>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed italic">
                 {selectedNode?.context || (selectedNode?.type === 'document' 
                   ? "Foundational knowledge source indexed in current session. Provides semantic anchors for related concept clusters."
                   : "Entity extracted from document corpus. Awaiting additional metadata sync...")
                 }
              </p>
           </div>

           <div className="space-y-3">
              <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Neural Connections</h5>
              <div className="space-y-2">
                 {network.edges.filter(e => e.source === selectedNode?.id || e.target === selectedNode?.id).map((rel, i) => {
                    const otherId = rel.source === selectedNode?.id ? rel.target : rel.source;
                    const otherNode = network.nodes.find(n => n.id === otherId);
                    return (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/30 transition-all cursor-pointer group/item">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover/item:text-indigo-400 transition-colors">
                                {otherNode && getTypeIcon(otherNode.type)}
                             </div>
                             <span className="text-[11px] font-bold text-zinc-200">{otherNode?.label}</span>
                          </div>
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">{rel.label}</span>
                       </div>
                    );
                 })}
              </div>
           </div>

           {neuralAuditInsights.length > 0 && (
               <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={12} /> Relationship Audit Insights
                  </h5>
                  <div className="space-y-2">
                     {neuralAuditInsights.map((insight, i) => (
                        <p key={i} className="text-[10px] text-zinc-400 font-medium leading-relaxed border-l-2 border-indigo-500/30 pl-3">
                           {insight}
                        </p>
                     ))}
                  </div>
               </div>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-900/50">
            <Button 
               onClick={runNeuralAudit}
               disabled={analyzing}
               className={cn(
                 "w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-3 shadow-xl transition-all shadow-indigo-600/20",
                 analyzing && "animate-pulse opacity-70"
               )}
            >
               {analyzing ? "Analyzing Synapses..." : "Analyze Relationship Path"} 
               {!analyzing && <ChevronRight size={18} />}
            </Button>
        </div>
      </div>
    </div>
  );
}
