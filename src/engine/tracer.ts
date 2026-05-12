import type { StateSnapshot } from '../types';

export function createTracer(_name: string) {
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  return {
    snapshots,
    record(line: number, description: string, extra?: Partial<StateSnapshot>): StateSnapshot {
      const snapshot: StateSnapshot = {
        step: step++,
        line,
        variables: [],
        description,
        ...extra,
      };
      snapshots.push(snapshot);
      return snapshot;
    },
    getSnapshots(): StateSnapshot[] {
      return snapshots;
    },
  };
}
