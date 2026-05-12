import { create } from 'zustand';
import { setSoundEnabled, isSoundEnabled } from '../engine/soundEngine';

interface SoundState {
  enabled: boolean;
  toggle: () => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  enabled: isSoundEnabled(),
  toggle: () =>
    set((s) => {
      const next = !s.enabled;
      setSoundEnabled(next);
      return { enabled: next };
    }),
}));
