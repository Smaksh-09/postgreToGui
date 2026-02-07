"use client";

import React, { useCallback, useMemo, useEffect } from 'react';
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
import TableNode, { TableNodeData } from './TableNode';

// --- AUTO LAYOUT LOGIC ---
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right layout
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    // We approximate width/height for the layout engine
    dagreGraph.setNode(node.id, { width: 240, height: 300 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return;
    node.position = {
      x: nodeWithPosition.x - 120,
      y: nodeWithPosition.y - 150,
    };
  });

  return { nodes, edges };
};

interface SchemaGraphProps {
  tables: any[];
  onNodeClick?: (tableName: string) => void;
}

export default function SchemaGraph({ tables, onNodeClick }: SchemaGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Register our custom "Cyberpunk Node"
  const nodeTypes = useMemo(() => ({ table: TableNode }), []);

  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const newNodes: Node<TableNodeData>[] = tables.map((table) => ({
      id: table.table_name,
      type: 'table',
      data: {
        label: table.table_name,
        columns: (table.columns || []).map((col: any) => ({
          name: col.name,
          type: col.type,
          isPk: false,
        })),
      },
      position: { x: 0, y: 0 },
    }));

    const newEdges: Edge[] = [];

    const layouted = getLayoutedElements(newNodes, newEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [tables, setNodes, setEdges]);

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
        minZoom={0.1}
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