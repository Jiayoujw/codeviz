import { create } from 'zustand';
import type { PlaybackState, PlaybackStatus } from '../types';

interface PlaybackActions {
  setStatus: (status: PlaybackStatus) => void;
  setSpeed: (speed: number) => void;
  setCurrentStep: (step: number) => void;
  setTotalSteps: (total: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState & PlaybackActions>((set, get) => ({
  status: 'idle',
  speed: 1,
  currentStep: 0,
  totalSteps: 0,
  snapshots: [],
  setStatus: (status) => set({ status }),
  setSpeed: (speed) => set({ speed }),
  setCurrentStep: (step) => set({ currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)) }),
  setTotalSteps: (total) => set({ totalSteps: total, currentStep: 0 }),
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ status: 'completed' });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  reset: () => set({ status: 'idle', currentStep: 0, snapshots: [], totalSteps: 0 }),
}));
