import { useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import { NEON_CYAN, NEON_GREEN, NEON_PINK, SURFACE_3, getThemeColors } from '../../utils/color';

export function LinkedListVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);

  const ll = currentSnapshot?.linkedListState;

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

    if (!ll || ll.nodes.length === 0) {
      const lang = useLangStore.getState().lang;
      const tr = getTranslations(lang);
      ctx.fillStyle = tc.emptyText;
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr.empty.linkedlist, W / 2, H / 2);
      return;
    }

    const nodeW = 80;
    const nodeH = 48;
    const gap = 60;
    const totalW = ll.nodes.length * nodeW + (ll.nodes.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const centerY = H / 2;

    // "HEAD" label
    if (ll.head) {
      ctx.fillStyle = NEON_CYAN;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HEAD', startX + nodeW / 2, centerY - 44);
    }

    ll.nodes.forEach((node, i) => {
      const x = startX + i * (nodeW + gap);
      const y = centerY - nodeH / 2;

      const color = node.highlighted ? NEON_PINK
        : ll.highlightedNode === node.id ? NEON_GREEN
        : NEON_CYAN;

      // Arrow line from previous node
      if (i > 0) {
        const prevX = startX + (i - 1) * (nodeW + gap) + nodeW;
        ctx.strokeStyle = SURFACE_3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX, centerY);
        ctx.lineTo(x - 4, centerY);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = SURFACE_3;
        ctx.beginPath();
        ctx.moveTo(x - 4, centerY - 6);
        ctx.lineTo(x + 6, centerY);
        ctx.lineTo(x - 4, centerY + 6);
        ctx.closePath();
        ctx.fill();
      }

      // Node glow
      const glowX = x + nodeW / 2;
      const glowY = centerY;
      const glowRadius = nodeW * 0.7;
      const glow = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, glowRadius);
      glow.addColorStop(0, color + '44');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Node rectangle
      ctx.fillStyle = getThemeColors().nodeFill;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, nodeW, nodeH, 8);
      ctx.fill();
      ctx.stroke();

      // Dividier line
      ctx.strokeStyle = color + '44';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + nodeW * 0.65, y + 6);
      ctx.lineTo(x + nodeW * 0.65, y + nodeH - 6);
      ctx.stroke();

      // Value
      ctx.fillStyle = color;
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(node.value), x + nodeW * 0.32, centerY);

      // Ptr
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('next', x + nodeW * 0.82, centerY);
    });
  }, [ll]);

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
