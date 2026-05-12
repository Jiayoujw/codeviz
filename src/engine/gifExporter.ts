import type { StateSnapshot, VisualizationType, ArrayState, TreeNodeData, GraphState, LinkedListState } from '../types';
import { getBarColor, getNodeColor, SURFACE_0, SURFACE_3, VISITED_COLOR, PATH_COLOR, NEON_CYAN } from '../utils/color';
import { layoutTree, layoutGraph } from '../utils/layout';

const FRAME_DELAY = 300;

function renderFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  snapshot: StateSnapshot,
  type: VisualizationType
) {
  ctx.fillStyle = SURFACE_0;
  ctx.fillRect(0, 0, W, H);

  switch (type) {
    case 'array':
      renderArrayFrame(ctx, W, H, snapshot.arrayState);
      break;
    case 'tree':
      renderTreeFrame(ctx, W, H, snapshot.treeState);
      break;
    case 'graph':
      renderGraphFrame(ctx, W, H, snapshot.graphState);
      break;
    case 'linkedlist':
      renderLinkedListFrame(ctx, W, H, snapshot.linkedListState);
      break;
  }
}

function renderArrayFrame(ctx: CanvasRenderingContext2D, W: number, H: number, state?: ArrayState) {
  if (!state || state.elements.length === 0) return;
  const elements = state.elements;
  const maxVal = Math.max(...elements);
  const barWidth = Math.min(50, (W - 60) / elements.length - 4);
  const totalW = elements.length * (barWidth + 4);
  const startX = (W - totalW) / 2;
  const chartH = H - 80;

  elements.forEach((val, i) => {
    const x = startX + i * (barWidth + 4) + barWidth / 2;
    const barH = (val / maxVal) * chartH;
    const y = H - 60 - barH;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `${Math.max(10, barWidth * 0.32)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(String(val), x, y - 6);
  });

  elements.forEach((val, i) => {
    const x = startX + i * (barWidth + 4);
    const barH = (val / maxVal) * chartH;
    const y = H - 60 - barH;
    const color = getBarColor(i, state);
    const glow = ctx.createLinearGradient(x, y, x, H - 60);
    glow.addColorStop(0, color);
    glow.addColorStop(1, color + '44');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();
  });
}

function renderTreeFrame(ctx: CanvasRenderingContext2D, _W: number, _H: number, tree?: TreeNodeData | null) {
  if (!tree) return;
  const laidOut = layoutTree(tree);
  drawTreeNode(ctx, laidOut);
}

function drawTreeNode(ctx: CanvasRenderingContext2D, node: TreeNodeData | null) {
  if (!node) return;
  if (node.left) {
    ctx.strokeStyle = node.left.visited ? VISITED_COLOR : SURFACE_3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(node.x ?? 0, node.y ?? 0);
    ctx.lineTo(node.left.x ?? 0, node.left.y ?? 0);
    ctx.stroke();
    drawTreeNode(ctx, node.left);
  }
  if (node.right) {
    ctx.strokeStyle = node.right.visited ? VISITED_COLOR : SURFACE_3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(node.x ?? 0, node.y ?? 0);
    ctx.lineTo(node.right.x ?? 0, node.right.y ?? 0);
    ctx.stroke();
    drawTreeNode(ctx, node.right);
  }
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const r = 22;
  const color = getNodeColor(node.visited, false, node.highlighted, false);
  ctx.fillStyle = '#12121a';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(node.value), x, y);
}

function renderGraphFrame(ctx: CanvasRenderingContext2D, W: number, H: number, graph?: GraphState) {
  if (!graph) return;
  const laidOut = layoutGraph({ ...graph, nodes: graph.nodes.map((n) => ({ ...n })) }, W, H);
  for (const edge of laidOut.edges) {
    const s = laidOut.nodes.find((n) => n.id === edge.source);
    const t = laidOut.nodes.find((n) => n.id === edge.target);
    if (!s || !t) continue;
    ctx.strokeStyle = edge.inPath ? PATH_COLOR : edge.highlighted ? NEON_CYAN : SURFACE_3;
    ctx.lineWidth = edge.inPath ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x ?? 0, s.y ?? 0);
    ctx.lineTo(t.x ?? 0, t.y ?? 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(edge.weight), ((s.x ?? 0) + (t.x ?? 0)) / 2, ((s.y ?? 0) + (t.y ?? 0)) / 2 - 6);
  }
  for (const node of laidOut.nodes) {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const color = getNodeColor(node.visited, node.current, false, laidOut.pathNodes.includes(node.id));
    ctx.fillStyle = '#12121a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, x, y);
  }
}

function renderLinkedListFrame(ctx: CanvasRenderingContext2D, W: number, H: number, ll?: LinkedListState) {
  if (!ll || ll.nodes.length === 0) return;
  const nodeW = 70;
  const nodeH = 42;
  const gap = 50;
  const totalW = ll.nodes.length * nodeW + (ll.nodes.length - 1) * gap;
  const startX = (W - totalW) / 2;
  const centerY = H / 2;

  ll.nodes.forEach((node, i) => {
    const x = startX + i * (nodeW + gap);
    const y = centerY - nodeH / 2;
    const color = node.highlighted ? '#ff2d78' : ll.highlightedNode === node.id ? '#39ff14' : NEON_CYAN;

    if (i > 0) {
      const px = startX + (i - 1) * (nodeW + gap) + nodeW;
      ctx.strokeStyle = SURFACE_3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, centerY);
      ctx.lineTo(x, centerY);
      ctx.stroke();
    }

    ctx.fillStyle = '#12121a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, nodeW, nodeH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.value), x + nodeW * 0.3, centerY);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px sans-serif';
    ctx.fillText('next', x + nodeW * 0.78, centerY);
  });
}

export async function exportGif(
  snapshots: StateSnapshot[],
  type: VisualizationType,
  speed: number
): Promise<void> {
  const W = 800;
  const H = 500;
  const totalFrames = Math.min(snapshots.length, 80);
  const step = Math.max(1, Math.floor(snapshots.length / totalFrames));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // GIF header
  const frames: { delay: number; dataUrl: string; }[] = [];

  for (let i = 0; i < snapshots.length; i += step) {
    renderFrame(ctx, W, H, snapshots[i], type);

    // Add step number overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W - 140, 8, 132, 28);
    ctx.fillStyle = '#00f5ff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Step ${snapshots[i].step + 1}/${snapshots.length}`, W - 16, 28);

    // Description overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, H - 36, W - 16, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    const desc = snapshots[i].description.slice(0, 100);
    ctx.fillText(desc, 16, H - 18);

    frames.push({
      delay: FRAME_DELAY / speed,
      dataUrl: canvas.toDataURL('image/gif'),
    });
  }

  // Since we can't easily create real GIFs in-browser without a library,
  // we'll generate a downloadable MP4-like sequence as an animated PNG/WebM approach
  // Instead, let's create a simple frame sequence zip, or better - use canvas capture to WebM

  // WebM export using MediaRecorder
  const stream = canvas.captureStream(30 / speed);
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeviz-animation-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  recorder.start();
  let frameIdx = 0;
  const drawInterval = setInterval(() => {
    if (frameIdx >= snapshots.length) {
      clearInterval(drawInterval);
      recorder.stop();
      return;
    }
    ctx.clearRect(0, 0, W, H);
    renderFrame(ctx, W, H, snapshots[frameIdx], type);

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W - 150, 8, 142, 28);
    ctx.fillStyle = '#00f5ff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Step ${snapshots[frameIdx].step + 1}/${snapshots.length}`, W - 16, 28);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, H - 36, W - 16, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(snapshots[frameIdx].description.slice(0, 100), 16, H - 18);

    frameIdx++;
  }, FRAME_DELAY / speed);
}
