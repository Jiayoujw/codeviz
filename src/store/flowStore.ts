import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeData } from '../types';

interface FlowState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<FlowNodeData>) => void;
  removeNode: (id: string) => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (id) => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),
}));
