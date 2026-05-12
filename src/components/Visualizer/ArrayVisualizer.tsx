import { useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { getBarColor, DEFAULT_BAR_COLOR, SURFACE_0 } from '../../utils/color';

export function ArrayVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);
  const snapshots = useVisualizerStore((s) => s.snapshots);
  const speed = usePlaybackStore((s) => s.speed);

  const snapshot = currentSnapshot?.arrayState;
  const elements = snapshot?.elements ?? [];

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
    ctx.fillStyle = SURFACE_0;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    if (elements.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select an algorithm to visualize', W / 2, H / 2);
      return;
    }

    const maxVal = Math.max(...elements);
    const barWidth = Math.min(60, (W - 80) / elements.length - 4);
    const totalBarsWidth = elements.length * (barWidth + 4);
    const startX = (W - totalBarsWidth) / 2;
    const chartH = H - 80;

    // Value labels at top
    elements.forEach((val, i) => {
      const x = startX + i * (barWidth + 4) + barWidth / 2;
      const barH = (val / maxVal) * chartH;
      const y = H - 60 - barH;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `${Math.max(10, barWidth * 0.35)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x, y - 6);
    });

    // Bars
    elements.forEach((val, i) => {
      const x = startX + i * (barWidth + 4);
      const barH = (val / maxVal) * chartH;
      const y = H - 60 - barH;

      const color = snapshot
        ? getBarColor(i, snapshot)
        : DEFAULT_BAR_COLOR;

      // Glow effect
      const glow = ctx.createLinearGradient(x, y, x, H - 60);
      glow.addColorStop(0, color);
      glow.addColorStop(1, color + '44');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Index labels
    elements.forEach((_, i) => {
      const x = startX + i * (barWidth + 4) + barWidth / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i), x, H - 42);
    });
  }, [elements, snapshot]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Auto-play animation
  useEffect(() => {
    const status = usePlaybackStore.getState().status;
    if (status !== 'running' || snapshots.length === 0) return;

    const interval = 500 / speed;
    let step = usePlaybackStore.getState().currentStep;

    const timer = setInterval(() => {
      const currentStatus = usePlaybackStore.getState().status;
      if (currentStatus !== 'running') { clearInterval(timer); return; }

      step++;
      if (step >= snapshots.length) {
        usePlaybackStore.getState().setStatus('completed');
        clearInterval(timer);
        return;
      }

      usePlaybackStore.getState().setCurrentStep(step);
      useVisualizerStore.getState().setCurrentSnapshot(snapshots[step]);
      draw();
    }, interval);

    return () => clearInterval(timer);
  }, [snapshots, speed, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
