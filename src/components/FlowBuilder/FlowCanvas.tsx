import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlgorithmNode } from './AlgorithmNodes';

const nodeTypes = { algorithm: AlgorithmNode };

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'algorithm',
    position: { x: 250, y: 100 },
    data: { label: 'Start', nodeType: 'start' },
  },
  {
    id: '2',
    type: 'algorithm',
    position: { x: 250, y: 250 },
    data: { label: 'Loop through array', nodeType: 'loop' },
  },
  {
    id: '3',
    type: 'algorithm',
    position: { x: 250, y: 400 },
    data: { label: 'Compare & Swap', nodeType: 'operation' },
  },
  {
    id: '4',
    type: 'algorithm',
    position: { x: 250, y: 550 },
    data: { label: 'End', nodeType: 'end' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

export function FlowCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full" style={{ background: '#0a0a0f' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{ animated: true }}
      >
        <Background color="#1a1a26" gap={24} />
        <Controls
          className="[&>button]:!bg-[#1a1a26] [&>button]:!border-[#2a2a3a] [&>button]:!text-white [&>button]:!fill-white"
        />
        <MiniMap
          style={{ background: '#12121a' }}
          maskColor="rgba(0,0,0,0.7)"
          nodeColor="#b347ea"
        />
      </ReactFlow>
    </div>
  );
}
