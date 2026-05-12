import { create } from 'zustand';
import type { StateSnapshot, VisualizationType } from '../types';

interface VisualizerState {
  visualizationType: VisualizationType;
  currentSnapshot: StateSnapshot | null;
  snapshots: StateSnapshot[];
  setVisualizationType: (type: VisualizationType) => void;
  setCurrentSnapshot: (snapshot: StateSnapshot | null) => void;
  setSnapshots: (snapshots: StateSnapshot[]) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  visualizationType: 'array',
  currentSnapshot: null,
  snapshots: [],
  setVisualizationType: (type) => set({ visualizationType: type }),
  setCurrentSnapshot: (snapshot) => set({ currentSnapshot: snapshot }),
  setSnapshots: (snapshots) => set({ snapshots }),
}));
