export interface ASTNode {
  type: string;
  [key: string]: unknown;
}

export interface VariableState {
  name: string;
  value: unknown;
  type: 'number' | 'array' | 'object' | 'string' | 'boolean';
}

export interface ArrayState {
  elements: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  pivot: number | null;
}

export interface TreeNodeData {
  id: string;
  value: number;
  left?: TreeNodeData;
  right?: TreeNodeData;
  x?: number;
  y?: number;
  highlighted: boolean;
  visited: boolean;
}

export interface GraphNodeData {
  id: string;
  label: string;
  x?: number;
  y?: number;
  visited: boolean;
  current: boolean;
  distance: number;
}

export interface GraphEdgeData {
  source: string;
  target: string;
  weight: number;
  highlighted: boolean;
  inPath: boolean;
}

export interface GraphState {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  currentNode: string | null;
  visitedNodes: string[];
  pathNodes: string[];
}

export interface LinkedListNodeData {
  id: string;
  value: number;
  x?: number;
  y?: number;
  highlighted: boolean;
}

export interface LinkedListState {
  nodes: LinkedListNodeData[];
  head: string | null;
  highlightedNode: string | null;
  pointerPosition: number | null;
}

export interface StateSnapshot {
  step: number;
  line: number;
  variables: VariableState[];
  arrayState?: ArrayState;
  treeState?: TreeNodeData | null;
  graphState?: GraphState;
  linkedListState?: LinkedListState;
  description: string;
}

export type VisualizationType = 'array' | 'tree' | 'graph' | 'linkedlist';

export type AlgorithmType =
  | 'bubbleSort' | 'selectionSort' | 'insertionSort' | 'mergeSort' | 'quickSort' | 'heapSort'
  | 'bstInsert' | 'bstSearch' | 'dfsTree' | 'bfsTree' | 'avlInsert'
  | 'bfsGraph' | 'dfsGraph' | 'dijkstra'
  | 'llInsertHead' | 'llDelete' | 'llReverse';

export interface AlgorithmTemplate {
  id: string;
  name: string;
  category: VisualizationType;
  code: string;
  description: string;
  icon: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type PlaybackStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface EditorState {
  code: string;
  language: string;
  currentLine: number;
}

export interface PlaybackState {
  status: PlaybackStatus;
  speed: number;
  currentStep: number;
  totalSteps: number;
  snapshots: StateSnapshot[];
}

export interface FlowNodeData {
  label: string;
  nodeType: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}
