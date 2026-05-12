import { useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import { layoutGraph } from '../../utils/layout';
import { getNodeColor, NEON_CYAN, PATH_COLOR, SURFACE_3, getThemeColors } from '../../utils/color';
import type { GraphState } from '../../types';

function renderGraph(
  ctx: CanvasRenderingContext2D,
  graph: GraphState
) {
  const nodeRadius = 28;

  // Draw edges
  for (const edge of graph.edges) {
    const source = graph.nodes.find((n) => n.id === edge.source);
    const target = graph.nodes.find((n) => n.id === edge.target);
    if (!source || !target) continue;

    const sx = source.x ?? 0;
    const sy = source.y ?? 0;
    const tx = target.x ?? 0;
    const ty = target.y ?? 0;

    // Edge line
    const color = edge.inPath ? PATH_COLOR
      : edge.highlighted ? NEON_CYAN
      : SURFACE_3;

    ctx.strokeStyle = color;
    ctx.lineWidth = edge.inPath ? 3 : (edge.highlighted ? 2.5 : 1.5);

    // Glow for path edges
    if (edge.inPath) {
      ctx.shadowColor = PATH_COLOR;
      ctx.shadowBlur = 10;
    }

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Weight label
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(edge.weight), mx, my - 8);
  }

  // Draw nodes
  for (const node of graph.nodes) {
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    const color = getNodeColor(
      node.visited,
      node.current,
      false,
      graph.pathNodes.includes(node.id)
    );

    // Glow
    const glowRadius = nodeRadius + 10;
    const glow = ctx.createRadialGradient(x, y, nodeRadius * 0.5, x, y, glowRadius);
    glow.addColorStop(0, color + '66');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Circle
    ctx.fillStyle = getThemeColors().nodeFill;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, x, y);

    // Distance
    if (node.distance !== Infinity && node.distance !== 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`d=${node.distance}`, x, y + nodeRadius + 14);
    }
  }
}

export function GraphVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);

  const graph = currentSnapshot?.graphState;

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

    const tc = getThemeColors();
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = tc.gridLine;
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    if (!graph) {
      const lang = useLangStore.getState().lang;
      const tr = getTranslations(lang);
      ctx.fillStyle = tc.emptyText;
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr.empty.graph, W / 2, H / 2);
      return;
    }

    const laidOut = layoutGraph(
      { ...graph, nodes: graph.nodes.map((n) => ({ ...n })) },
      W,
      H
    );
    renderGraph(ctx, laidOut);
  }, [graph]);

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
