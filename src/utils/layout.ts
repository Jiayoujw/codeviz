import type { TreeNodeData, GraphState } from '../types';

export function layoutTree(
  root: TreeNodeData | null,
  _nodeWidth?: number,
  horizontalSpacing = 80,
  verticalSpacing = 100
): TreeNodeData | null {
  if (!root) return null;

  let maxDepth = 0;
  function calcDepth(node: TreeNodeData, d: number) {
    maxDepth = Math.max(maxDepth, d);
    if (node.left) calcDepth(node.left, d + 1);
    if (node.right) calcDepth(node.right, d + 1);
  }
  calcDepth(root, 0);

  const canvasWidth = Math.pow(2, maxDepth + 1) * horizontalSpacing;

  function assignPositions(node: TreeNodeData, depth: number, left: number, right: number) {
    const x = (left + right) / 2;
    const y = depth * verticalSpacing + 60;
    node.x = x;
    node.y = y;

    if (node.left) assignPositions(node.left, depth + 1, left, x);
    if (node.right) assignPositions(node.right, depth + 1, x, right);
  }

  assignPositions(root, 0, 0, canvasWidth);
  return root;
}

export function layoutGraph(
  graph: GraphState,
  width: number,
  height: number
): GraphState {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const n = graph.nodes.length;

  graph.nodes.forEach((node, i) => {
    if (node.x == null || node.y == null) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    }
  });

  return graph;
}
