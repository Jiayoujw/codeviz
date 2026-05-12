import { useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import type { GridCell } from '../../types';

const CELL_COLORS: Record<GridCell['type'], string> = {
  empty: '#1a1a26',
  wall: '#2a2a3a',
  start: '#39ff14',
  end: '#ff2d78',
  path: '#ffe600',
  visited: '#2a1a3a',
  current: '#00f5ff',
  open: '#1a2a3a',
};

export function GridVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);
  const grid = currentSnapshot?.gridState;

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
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    const lang = useLangStore.getState().lang;
    const tr = getTranslations(lang);

    if (!grid) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr.empty.grid, W / 2, H / 2);
      return;
    }

    const cellSize = Math.min(
      (W - 20) / grid.cols,
      (H - 20) / grid.rows,
      40
    );
    const offsetX = (W - cellSize * grid.cols) / 2;
    const offsetY = (H - cellSize * grid.rows) / 2;

    // Draw cells
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const cell = grid.cells[r][c];
        const x = offsetX + c * cellSize;
        const y = offsetY + r * cellSize;

        let color = CELL_COLORS[cell.type] || CELL_COLORS.empty;

        // Glow for open/current cells
        if (cell.type === 'current' || cell.type === 'open') {
          const glow = ctx.createRadialGradient(x + cellSize/2, y + cellSize/2, 0, x + cellSize/2, y + cellSize/2, cellSize * 0.8);
          glow.addColorStop(0, color + '66');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(x - cellSize/2, y - cellSize/2, cellSize * 2, cellSize * 2);
        }

        ctx.fillStyle = color;
        ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
        ctx.strokeStyle = '#0a0a0f';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

        // Show f value on open/visited cells
        if ((cell.type === 'open' || cell.type === 'current') && cellSize > 25 && cell.f > 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = `${Math.max(8, cellSize * 0.28)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${cell.f}`, x + cellSize / 2, y + cellSize / 2 - 4);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = `${Math.max(7, cellSize * 0.2)}px monospace`;
          ctx.fillText(`g${cell.g}`, x + cellSize / 2, y + cellSize / 2 + cellSize * 0.28);
        }

        // Start/End icons
        if (cell.type === 'start' && cellSize > 20) {
          ctx.fillStyle = '#39ff14';
          ctx.font = `${Math.max(10, cellSize * 0.5)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S', x + cellSize / 2, y + cellSize / 2);
        }
        if (cell.type === 'end' && cellSize > 20) {
          ctx.fillStyle = '#ff2d78';
          ctx.font = `${Math.max(10, cellSize * 0.5)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('E', x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  }, [grid]);

  useEffect(() => { draw(); window.addEventListener('resize', draw); return () => window.removeEventListener('resize', draw); }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}
