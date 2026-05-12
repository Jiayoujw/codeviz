import { useCallback } from 'react';
import { usePlaybackStore } from '../store/playbackStore';
import { useVisualizerStore } from '../store/visualizerStore';
import { useEditorStore } from '../store/editorStore';

export function useCodeExecution() {
  const snapshots = useVisualizerStore((s) => s.snapshots);
  const setCurrentSnapshot = useVisualizerStore((s) => s.setCurrentSnapshot);
  const playback = usePlaybackStore();
  const setCurrentLine = useEditorStore((s) => s.setCurrentLine);

  const run = useCallback(() => {
    if (snapshots.length === 0) return;
    playback.setStatus('running');
    playback.setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      if (step >= snapshots.length) {
        clearInterval(interval);
        playback.setStatus('completed');
        return;
      }
      const status = usePlaybackStore.getState().status;
      if (status !== 'running') {
        clearInterval(interval);
        return;
      }
      setCurrentSnapshot(snapshots[step]);
      setCurrentLine(snapshots[step].line);
      playback.setCurrentStep(step);
      step++;
    }, 500 / playback.speed);
  }, [snapshots, playback, setCurrentSnapshot, setCurrentLine]);

  const pause = useCallback(() => {
    playback.setStatus('paused');
  }, [playback]);

  const resume = useCallback(() => {
    playback.setStatus('running');
  }, [playback]);

  const stepForward = useCallback(() => {
    const { currentStep } = usePlaybackStore.getState();
    if (currentStep < snapshots.length - 1) {
      const next = currentStep + 1;
      playback.setCurrentStep(next);
      setCurrentSnapshot(snapshots[next]);
      setCurrentLine(snapshots[next].line);
    }
  }, [snapshots, playback, setCurrentSnapshot, setCurrentLine]);

  const stepBackward = useCallback(() => {
    const { currentStep } = usePlaybackStore.getState();
    if (currentStep > 0) {
      const prev = currentStep - 1;
      playback.setCurrentStep(prev);
      setCurrentSnapshot(snapshots[prev]);
      setCurrentLine(snapshots[prev].line);
    }
  }, [snapshots, playback, setCurrentSnapshot, setCurrentLine]);

  return { run, pause, resume, stepForward, stepBackward };
}
