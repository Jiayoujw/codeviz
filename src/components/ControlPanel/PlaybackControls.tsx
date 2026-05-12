import { useCallback, useState, useEffect } from 'react';
import { usePlaybackStore } from '../../store/playbackStore';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useEditorStore } from '../../store/editorStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import { exportGif } from '../../engine/gifExporter';
import { playStepSound, playCompleteSound, isSoundEnabled } from '../../engine/soundEngine';
import { runUserCode } from '../../engine/interpreter';

export function PlaybackControls() {
  const status = usePlaybackStore((s) => s.status);
  const setStatus = usePlaybackStore((s) => s.setStatus);
  const speed = usePlaybackStore((s) => s.speed);
  const setSpeed = usePlaybackStore((s) => s.setSpeed);
  const currentStep = usePlaybackStore((s) => s.currentStep);
  const setCurrentStep = usePlaybackStore((s) => s.setCurrentStep);
  const totalSteps = usePlaybackStore((s) => s.totalSteps);
  const setTotalSteps = usePlaybackStore((s) => s.setTotalSteps);
  const snapshots = useVisualizerStore((s) => s.snapshots);
  const setSnapshots = useVisualizerStore((s) => s.setSnapshots);
  const setVisualizationType = useVisualizerStore((s) => s.setVisualizationType);
  const setCurrentSnapshot = useVisualizerStore((s) => s.setCurrentSnapshot);
  const setCurrentLine = useEditorStore((s) => s.setCurrentLine);
  const visualizationType = useVisualizerStore((s) => s.visualizationType);

  const lang = useLangStore((s) => s.lang);
  const tr = getTranslations(lang);

  const [exporting, setExporting] = useState(false);

  const isRunning = status === 'running';

  const handlePlay = useCallback(() => {
    if (snapshots.length === 0) return;
    if (status === 'completed') {
      setCurrentStep(0);
      setCurrentSnapshot(snapshots[0]);
      setCurrentLine(snapshots[0].line);
    }
    setStatus('running');
  }, [snapshots, status, setStatus, setCurrentStep, setCurrentSnapshot, setCurrentLine]);

  const handlePause = useCallback(() => {
    setStatus('paused');
  }, [setStatus]);

  const handleStepForward = useCallback(() => {
    if (snapshots.length === 0) return;
    if (currentStep < snapshots.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setCurrentSnapshot(snapshots[next]);
      setCurrentLine(snapshots[next].line);
      setStatus('paused');
      if (isSoundEnabled()) playStepSound();
    } else {
      setStatus('completed');
      if (isSoundEnabled()) playCompleteSound();
    }
  }, [snapshots, currentStep, setCurrentStep, setCurrentSnapshot, setCurrentLine, setStatus]);

  const handleStepBack = useCallback(() => {
    if (snapshots.length === 0) return;
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setCurrentSnapshot(snapshots[prev]);
      setCurrentLine(snapshots[prev].line);
    }
  }, [snapshots, currentStep, setCurrentStep, setCurrentSnapshot, setCurrentLine]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, [setSpeed]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setCurrentStep(0);
    setCurrentSnapshot(null);
    setCurrentLine(-1);
  }, [setStatus, setCurrentStep, setCurrentSnapshot, setCurrentLine]);

  const handleExportGif = useCallback(async () => {
    if (snapshots.length === 0 || exporting) return;
    setExporting(true);
    try {
      await exportGif(snapshots, visualizationType, speed);
    } catch (e) {
      console.error('GIF export failed:', e);
    } finally {
      setExporting(false);
    }
  }, [snapshots, visualizationType, speed, exporting]);

  const handleRun = useCallback(() => {
    const code = useEditorStore.getState().code;
    if (!code.trim()) return;
    setStatus('idle');
    setCurrentStep(0);
    const results = runUserCode(code);
    if (results.length === 0) return;

    // Deduce visualization type from first snapshot
    const first = results[0];
    let vizType = 'array' as 'array' | 'tree' | 'graph' | 'linkedlist' | 'grid' | 'dp';
    if (first.gridState) vizType = 'grid';
    else if (first.dpState) vizType = 'dp';
    else if (first.treeState) vizType = 'tree';
    else if (first.graphState) vizType = 'graph';
    else if (first.linkedListState) vizType = 'linkedlist';

    setVisualizationType(vizType);
    setSnapshots(results);
    setTotalSteps(results.length);
    setCurrentSnapshot(results[0]);
    setCurrentLine(results[0].line);
  }, [setStatus, setCurrentStep, setVisualizationType, setSnapshots, setTotalSteps, setCurrentSnapshot, setCurrentLine]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in editor
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).getAttribute('contenteditable')) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (status === 'running') handlePause();
          else handlePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleStepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleStepBack();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleReset();
          }
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRun();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handlePlay, handlePause, handleStepForward, handleStepBack, handleReset, handleRun]);

  const description = snapshots[currentStep]?.description ?? '';

  const statusText: Record<string, string> = {
    idle: tr.controls.idle,
    running: tr.controls.running,
    paused: tr.controls.paused,
    completed: tr.controls.completed,
  };

  return (
    <div className="h-14 flex items-center gap-4 px-4 border-t border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0">
      {/* Play/Pause */}
      <button
        onClick={isRunning ? handlePause : handlePlay}
        className="w-10 h-10 rounded-full border-2 border-[var(--color-neon-cyan)] flex items-center justify-center hover:bg-[var(--color-neon-cyan)]/10 transition-all hover:shadow-[0_0_15px_var(--color-neon-cyan)]"
        title={isRunning ? tr.controls.pause : tr.controls.play}
      >
        {isRunning ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-neon-cyan)">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-neon-cyan)">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Step backward */}
      <button onClick={handleStepBack} className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-neon-cyan)] transition-colors" title={tr.controls.stepBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="16" y="5" width="4" height="14" rx="1" /><polygon points="8,12 16,4 16,20" />
        </svg>
      </button>

      {/* Step forward */}
      <button onClick={handleStepForward} className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-neon-cyan)] transition-colors" title={tr.controls.stepForward}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="5" width="4" height="14" rx="1" /><polygon points="16,12 8,4 8,20" />
        </svg>
      </button>

      {/* Reset */}
      <button onClick={handleReset} className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-neon-pink)] transition-colors" title={tr.controls.reset}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 1 9 9" /><polyline points="3 3 3 12 12 12" />
        </svg>
      </button>

      {/* Run user code */}
      <button
        onClick={handleRun}
        className="px-3 py-1.5 text-xs rounded border border-[var(--color-neon-green)]/30 text-[var(--color-neon-green)] hover:border-[var(--color-neon-green)] hover:shadow-[0_0_10px_var(--color-neon-green)] transition-all flex items-center gap-1"
        title={lang === 'zh-CN' ? '运行代码' : 'Run Code'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        {lang === 'zh-CN' ? '运行' : 'Run'}
      </button>

      {/* Speed control */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs text-[var(--color-text-secondary)]">{tr.controls.speed}</span>
        <input
          type="range" min="0.25" max="4" step="0.25" value={speed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          className="w-24 h-1 accent-[var(--color-neon-cyan)]"
        />
        <span className="text-xs text-[var(--color-neon-cyan)] w-8">{speed}x</span>
      </div>

      {/* Step counter */}
      <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <span>{tr.controls.step}</span>
        <span className="text-[var(--color-neon-cyan)]">{currentStep + 1}</span>
        <span>/</span>
        <span>{totalSteps || snapshots.length}</span>
      </div>

      {/* Status badge */}
      <div className={`text-xs px-2 py-1 rounded ${
        status === 'running' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] animate-pulse' :
        status === 'completed' ? 'bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)]' :
        'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
      }`}>
        {statusText[status] ?? status}
      </div>

      {/* Export GIF */}
      <button
        onClick={handleExportGif}
        disabled={exporting || snapshots.length === 0}
        className={`px-3 py-1.5 text-xs rounded border transition-all flex items-center gap-1.5 ${
          exporting
            ? 'border-[var(--color-neon-orange)] text-[var(--color-neon-orange)] animate-pulse'
            : 'border-[var(--color-neon-green)]/30 text-[var(--color-neon-green)] hover:border-[var(--color-neon-green)] hover:shadow-[0_0_10px_var(--color-neon-green)]'
        }`}
        title={tr.controls.exportGif}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        {exporting ? tr.controls.exporting : tr.controls.exportGif}
      </button>

      {/* Description */}
      <div className="text-xs text-[var(--color-text-secondary)] truncate max-w-md">
        {description}
      </div>
    </div>
  );
}
