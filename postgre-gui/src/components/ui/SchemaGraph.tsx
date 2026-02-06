"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import TableNode from './TableNode';

// --- MOCK DATA FOR VIBE CHECK ---
// Eventually this comes from your backend /api/schema
const INITIAL_NODES_DATA = [
  { 
    id: 'users', 
    type: 'table', 
    data: { 
      label: 'users', 
      columns: [
        { name: 'id', type: 'uuid', isPk: true },
        { name: 'email', type: 'varchar' },
        { name: 'full_name', type: 'varchar' },
        { name: 'created_at', type: 'timestamp' }
      ] 
    },
    position: { x: 0, y: 0 } 
  },
  { 
    id: 'posts', 
    type: 'table', 
    data: { 
      label: 'posts', 
      columns: [
        { name: 'id', type: 'uuid', isPk: true },
        { name: 'user_id', type: 'uuid' }, // FK
        { name: 'title', type: 'text' },
        { name: 'published', type: 'boolean' }
      ] 
    },
    position: { x: 0, y: 0 } 
  },
  { 
    id: 'comments', 
    type: 'table', 
    data: { 
      label: 'comments', 
      columns: [
        { name: 'id', type: 'uuid', isPk: true },
        { name: 'post_id', type: 'uuid' }, // FK
        { name: 'author_id', type: 'uuid' }, // FK
        { name: 'content', type: 'text' }
      ] 
    },
    position: { x: 0, y: 0 } 
  }
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: 'users', target: 'posts', animated: true, style: { stroke: '#f97316' } }, // Orange edge
  { id: 'e2-3', source: 'posts', target: 'comments', animated: true, style: { stroke: '#f97316' } },
  { id: 'e1-3', source: 'users', target: 'comments', animated: true, style: { stroke: '#f97316', strokeDasharray: '5,5' } },
];

// --- AUTO LAYOUT LOGIC ---
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right layout
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    // We approximate width/height for the layout engine
    dagreGraph.setNode(node.id, { width: 220, height: 200 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return;
    node.position = {
      x: nodeWithPosition.x - 110, // Center offset
      y: nodeWithPosition.y - 100,
    };
  });

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  INITIAL_NODES_DATA,
  INITIAL_EDGES
);

export default function SchemaGraph({ onNodeClick }: { onNodeClick?: (tableName: string) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Register our custom "Cyberpunk Node"
  const nodeTypes = useMemo(() => ({ table: TableNode }), []);

  const handleNodeClick = useCallback((event: any, node: Node) => {
      if (onNodeClick) onNodeClick(node.data.label);
  }, [onNodeClick]);

  return (
    <div className="h-full w-full bg-[#050505]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }} // Hide the ReactFlow watermark (requires pro or just use this for clean ui)
      >
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="rgba(255, 255, 255, 0.1)" 
        />
      </ReactFlow>
    </div>
  );
}