import type { StateSnapshot, DPTableState } from '../../types';

function createDPSnapshot(step: number, line: number, dp: DPTableState, description: string): StateSnapshot {
  return { step, line, variables: [], description, dpState: dp };
}

function cloneDP(dp: DPTableState): DPTableState {
  return { ...dp, dp: dp.dp.map((row) => [...row]) };
}

export function fibonacciSnapshots(_data?: unknown): StateSnapshot[] {
  const n = 10;
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  const state: DPTableState = {
    dp: [Array.from({ length: n + 1 }, () => 0)],
    highlighted: null,
    rowLabels: ['fib(n)'],
    colLabels: Array.from({ length: n + 1 }, (_, i) => String(i)),
    description: '',
  };

  state.dp[0][0] = 0;
  state.dp[0][1] = 1;
  snapshots.push(createDPSnapshot(step++, 1, cloneDP(state), 'Fibonacci: fib(0)=0, fib(1)=1'));

  for (let i = 0; i <= n; i++) {
    if (i >= 2) {
      state.highlighted = [0, i];
      state.dp[0][i] = state.dp[0][i - 1] + state.dp[0][i - 2];
      snapshots.push(createDPSnapshot(step++, 3, cloneDP(state),
        `fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${state.dp[0][i - 1]} + ${state.dp[0][i - 2]} = ${state.dp[0][i]}`));
    }
  }

  state.highlighted = null;
  snapshots.push(createDPSnapshot(step++, 5, cloneDP(state), `Fibonacci complete! fib(${n})=${state.dp[0][n]}`));
  return snapshots;
}

export function knapsackSnapshots(_data?: unknown): StateSnapshot[] {
  const weights = [2, 3, 4, 5];
  const values = [3, 4, 5, 6];
  const capacity = 8;
  const n = weights.length;
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  const state: DPTableState = {
    dp: Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0)),
    highlighted: null,
    rowLabels: ['0', ...weights.map((w, i) => `w=${w},v=${values[i]}`)],
    colLabels: Array.from({ length: capacity + 1 }, (_, i) => String(i)),
    description: '',
  };

  snapshots.push(createDPSnapshot(step++, 1, cloneDP(state), `0/1 Knapsack: weights=[${weights}], values=[${values}], capacity=${capacity}`));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      state.highlighted = [i, w];

      if (weights[i - 1] <= w) {
        const include = values[i - 1] + state.dp[i - 1][w - weights[i - 1]];
        const exclude = state.dp[i - 1][w];

        snapshots.push(createDPSnapshot(step++, 3, cloneDP(state),
          `Item ${i} (wt=${weights[i - 1]}, val=${values[i - 1]}): include=${include} vs exclude=${exclude}`));

        state.dp[i][w] = Math.max(include, exclude);
      } else {
        state.dp[i][w] = state.dp[i - 1][w];
        snapshots.push(createDPSnapshot(step++, 4, cloneDP(state),
          `Item ${i} too heavy (${weights[i - 1]} > ${w}), skip`));
      }
    }
  }

  state.highlighted = [n, capacity];
  snapshots.push(createDPSnapshot(step++, 6, cloneDP(state), `Knapsack complete! Max value = ${state.dp[n][capacity]}`));
  return snapshots;
}

export function binarySearchSnapshots(_data?: unknown): StateSnapshot[] {
  const arr = [3, 7, 11, 15, 19, 23, 28, 31, 36, 42, 47, 50];
  const target = 23;
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  snapshots.push({
    step: step++, line: 1, variables: [],
    description: `Binary Search: find ${target} in [${arr.join(', ')}]`,
    arrayState: {
      elements: arr,
      comparing: null, swapping: null,
      sorted: Array.from({ length: arr.length }, (_, i) => i),
      pivot: null,
    },
  });

  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    snapshots.push({
      step: step++, line: 3, variables: [],
      description: `Checking mid=arr[${mid}]=${arr[mid]}. Range: [${left}, ${right}]`,
      arrayState: {
        elements: arr,
        comparing: null, swapping: null,
        sorted: Array.from({ length: arr.length }, (_, i) => i),
        pivot: mid,
      },
    });

    if (arr[mid] === target) {
      snapshots.push({
        step: step++, line: 5, variables: [],
        description: `Found ${target} at index ${mid}!`,
        arrayState: {
          elements: arr,
          comparing: null, swapping: null,
          sorted: [mid],
          pivot: mid,
        },
      });
      return snapshots;
    } else if (arr[mid] < target) {
      left = mid + 1;
      snapshots.push({
        step: step++, line: 7, variables: [],
        description: `${arr[mid]} < ${target}, search right half`,
        arrayState: {
          elements: arr,
          comparing: null, swapping: null,
          sorted: Array.from({ length: mid + 1 }, (_, i) => i),
          pivot: null,
        },
      });
    } else {
      right = mid - 1;
      snapshots.push({
        step: step++, line: 9, variables: [],
        description: `${arr[mid]} > ${target}, search left half`,
        arrayState: {
          elements: arr,
          comparing: null, swapping: null,
          sorted: Array.from({ length: arr.length - mid }, (_, i) => i + mid),
          pivot: null,
        },
      });
    }
  }

  return snapshots;
}
