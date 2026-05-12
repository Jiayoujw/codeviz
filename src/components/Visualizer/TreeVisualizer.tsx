import { useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import { layoutTree } from '../../utils/layout';
import { getNodeColor, SURFACE_3, VISITED_COLOR } from '../../utils/color';
import type { TreeNodeData } from '../../types';

function renderTree(
  ctx: CanvasRenderingContext2D,
  node: TreeNodeData | null | undefined
) {
  if (!node) return;

  // Draw edges first
  drawEdges(ctx, node);

  // Draw nodes
  drawNode(ctx, node);
}

function drawEdges(ctx: CanvasRenderingContext2D, node: TreeNodeData) {
  if (node.left) {
    ctx.strokeStyle = node.left.visited ? VISITED_COLOR : SURFACE_3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(node.x ?? 0, node.y ?? 0);
    ctx.lineTo(node.left.x ?? 0, node.left.y ?? 0);
    ctx.stroke();
    drawEdges(ctx, node.left);
  }
  if (node.right) {
    ctx.strokeStyle = node.right.visited ? VISITED_COLOR : SURFACE_3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(node.x ?? 0, node.y ?? 0);
    ctx.lineTo(node.right.x ?? 0, node.right.y ?? 0);
    ctx.stroke();
    drawEdges(ctx, node.right);
  }
}

function drawNode(ctx: CanvasRenderingContext2D, node: TreeNodeData) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const r = 24;

  const color = getNodeColor(
    node.visited,
    false,
    node.highlighted,
    false
  );

  // Glow
  const glowRadius = r + 8;
  const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);
  glow.addColorStop(0, color + '66');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Circle
  ctx.fillStyle = '#12121a';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Value
  ctx.fillStyle = color;
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(node.value), x, y);

  if (node.left) drawNode(ctx, node.left);
  if (node.right) drawNode(ctx, node.right);
}

export function TreeVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);

  const tree = currentSnapshot?.treeState;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    if (!tree) {
      const lang = useLangStore.getState().lang;
      const tr = getTranslations(lang);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr.empty.tree, W / 2, H / 2);
      return;
    }

    const laidOut = layoutTree(tree);
    renderTree(ctx, laidOut);
  }, [tree]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
