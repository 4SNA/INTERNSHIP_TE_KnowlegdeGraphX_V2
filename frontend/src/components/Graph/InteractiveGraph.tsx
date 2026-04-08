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
  const [network, setNetwork] = React.useState<KnowledgeNetwork>({ nodes: [], edges: [] });
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<NeuralNode | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const [analysisResults, setAnalysisResults] = React.useState<string[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);

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

      const docNodes = data.nodes.filter((n: any) => n.type === 'document');
      
      const docsWithPos = docNodes.map((n: any, i: number) => {
         const angle = (i / Math.max(1, docNodes.length)) * 2 * Math.PI;
         const r = 220; 
         return { ...n, x: 500 + r * Math.cos(angle), y: 350 + r * Math.sin(angle) };
      });

      const processedNodes = data.nodes.map((node: any) => {
         if (node.type === 'document') {
            return docsWithPos.find((d: any) => d.id === node.id);
         }
         const parentEdge = data.edges.find((e: any) => e.target === node.id && e.source.startsWith('doc_'));
         const parent = parentEdge ? docsWithPos.find((d: any) => d.id === parentEdge.source) : null;
         
         if (parent) {
            const angle = Math.random() * 2 * Math.PI;
            const dist = 140 + Math.random() * 60;
            return { ...node, x: parent.x + dist * Math.cos(angle), y: parent.y + dist * Math.sin(angle) };
         }
         return { ...node, x: 500 + 400 * Math.cos(Math.random()), y: 350 + 400 * Math.sin(Math.random()) };
      });
      
      setNetwork({ ...data, nodes: processedNodes });
    } catch (err) {
      console.error("Neural Graph fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  React.useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

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
      setAnalysisResults(res.data.insights || []);
    } catch (err) {
      console.error("Neural Audit failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
    const node = network.nodes.find(n => n.id === id);
    if (node) {
      setOffset({ x: e.clientX / zoom - (node.x || 0), y: e.clientY / zoom - (node.y || 0) });
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
    }
  };

  const handleMouseUp = () => setDraggingId(null);

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'document': return <FileText size={18} />;
      case 'person': 
      case 'people': return <User size={18} />;
      case 'subject': return <Network size={18} />;
      case 'marks': return <Sparkles size={18} />;
      case 'identifier': return <Maximize2 size={18} />;
      case 'organization': return <Building2 size={18} />;
      case 'concept': return <Lightbulb size={18} />;
      case 'topic':
      case 'keyword': return <Tag size={18} />;
      default: return <Brain size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'document': return 'bg-zinc-900 border-zinc-700 text-indigo-400';
      case 'person':
      case 'people': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'subject': return 'bg-violet-500/10 border-violet-500/30 text-violet-400';
      case 'marks': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'identifier': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'topic':
      case 'keyword': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
      default: return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-zinc-950 border border-zinc-900 rounded-[40px] overflow-hidden select-none shadow-2xl glass overscroll-none flex"
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
            
            const x1 = source.x * zoom;
            const y1 = source.y * zoom;
            const x2 = target.x * zoom;
            const y2 = target.y * zoom;
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const normX = dy / len;
            const normY = -dx / len;
            const qX = midX + normX * 30; 
            const qY = midY + normY * 30;

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={`M ${x1} ${y1} Q ${qX} ${qY} ${x2} ${y2}`}
                  stroke={isHighlighted ? "#6366f1" : "#27272a"}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  fill="none"
                  markerEnd={isHighlighted ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                  className="transition-all duration-300"
                  opacity={isHighlighted ? 0.9 : 0.2}
                />
                {isHighlighted && (
                  <text
                    x={qX}
                    y={qY - 10}
                    fill="#818cf8"
                    fontSize="9"
                    fontWeight="black"
                    textAnchor="middle"
                    className="drop-shadow-lg uppercase tracking-widest bg-zinc-950"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-700 animate-pulse">
               <Brain size={48} className="text-indigo-500 animate-bounce" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Neural Synapses...</p>
            </div>
          ) : network.nodes.map((node) => (
            <div 
              key={node.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-300",
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
                "w-24 h-24 rounded-[32px] flex items-center justify-center border transition-all shadow-2xl relative",
                getTypeColor(node.type),
                activeNodeId === node.id && "ring-4 ring-indigo-500/20 border-indigo-400 bg-zinc-950 scale-110"
              )}>
                 {getTypeIcon(node.type)}
                 {node.type === 'document' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-zinc-950">
                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </div>
                 )}
              </div>
              <div className={cn(
                "mt-3 px-4 py-2 rounded-2xl border backdrop-blur-3xl transition-all text-[11px] font-bold uppercase tracking-widest whitespace-nowrap shadow-xl",
                activeNodeId === node.id 
                  ? "bg-indigo-500 text-white border-indigo-400 translate-y-1" 
                  : "bg-zinc-900/80 border-zinc-800/50 text-zinc-400"
              )}>
                 {node.label}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-8 flex items-center gap-3">
           <Card className="flex items-center gap-1 p-1 bg-zinc-900/40 border-zinc-800/40 backdrop-blur-2xl rounded-[20px] shadow-2xl">
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomIn size={18} /></button>
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"><ZoomOut size={18} /></button>
           </Card>
           <Button onClick={() => fetchGraph()} variant="ghost" className="bg-zinc-900/40 border-zinc-800/40 backdrop-blur-2xl rounded-[20px] h-11 px-6 text-[10px] uppercase font-black tracking-widest text-zinc-400">
              <Maximize2 size={14} className="mr-3" /> Auto Layout
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

           {analysisResults.length > 0 && (
               <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={12} /> Relationship Audit Insights
                  </h5>
                  <div className="space-y-2">
                     {analysisResults.map((insight, i) => (
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
