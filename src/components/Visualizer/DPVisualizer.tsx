import { useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';

export function DpVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);
  const dp = currentSnapshot?.dpState;

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

    if (!dp || dp.dp.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr.empty.dp, W / 2, H / 2);
      return;
    }

    const rows = dp.dp.length;
    const cols = dp.dp[0].length;
    const cellW = Math.min(70, (W - 120) / (cols + 1));
    const cellH = Math.min(36, (H - 80) / (rows + 1));
    const labelW = 110;
    const startX = labelW + 10;
    const startY = 40;

    // Column labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let c = 0; c < cols; c++) {
      ctx.fillText(dp.colLabels[c] ?? String(c), startX + c * cellW + cellW / 2, startY - 8);
    }

    // Row labels
    ctx.textAlign = 'right';
    for (let r = 0; r < rows; r++) {
      ctx.fillText(dp.rowLabels[r] ?? String(r), startX - 8, startY + r * cellH + cellH / 2 + 4);
    }

    // Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * cellW;
        const y = startY + r * cellH;
        const isHighlighted = dp.highlighted && dp.highlighted[0] === r && dp.highlighted[1] === c;

        let bgColor = '#1a1a26';
        let borderColor = '#2a2a3a';
        let textColor = 'rgba(255,255,255,0.7)';

        if (isHighlighted) {
          bgColor = '#b347ea22';
          borderColor = '#b347ea';
          textColor = '#b347ea';
        } else if (r === rows - 1 && c === cols - 1 && dp.highlighted === null && dp.dp[r][c] > 0) {
          bgColor = '#39ff1411';
          borderColor = '#39ff1466';
          textColor = '#39ff14';
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, cellW - 2, cellH - 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isHighlighted ? 2 : 0.5;
        ctx.strokeRect(x, y, cellW - 2, cellH - 2);

        ctx.fillStyle = textColor;
        ctx.font = `${isHighlighted ? 'bold ' : ''}12px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(dp.dp[r][c]), x + (cellW - 2) / 2, y + (cellH - 2) / 2);
      }
    }
  }, [dp]);

  useEffect(() => { draw(); window.addEventListener('resize', draw); return () => window.removeEventListener('resize', draw); }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}
