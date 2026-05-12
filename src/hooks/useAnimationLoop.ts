import { useEffect, useRef } from 'react';
import { usePlaybackStore } from '../store/playbackStore';

export function useAnimationLoop(onFrame: () => void) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const status = usePlaybackStore.getState().status;
    if (status !== 'running') return;

    const speed = usePlaybackStore.getState().speed;
    const interval = 1000 / (speed * 2);

    const loop = (time: number) => {
      if (time - lastTimeRef.current >= interval) {
        lastTimeRef.current = time;
        onFrame();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [onFrame]);
}
