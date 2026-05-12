import type { StateSnapshot, ArrayState } from '../../types';

function createArraySnapshot(
  step: number,
  line: number,
  elements: number[],
  description: string,
  extra: Partial<ArrayState> = {}
): StateSnapshot {
  return {
    step,
    line,
    variables: [
      { name: 'arr', value: [...elements], type: 'array' },
      { name: 'n', value: elements.length, type: 'number' },
    ],
    description,
    arrayState: {
      elements: [...elements],
      comparing: extra.comparing ?? null,
      swapping: extra.swapping ?? null,
      sorted: extra.sorted ?? [],
      pivot: extra.pivot ?? null,
    },
  };
}

export function bubbleSortSnapshots(input?: number[]): StateSnapshot[] {
  const arr = input ?? generateRandomArray(15);
  const snapshots: StateSnapshot[] = [];
  const n = arr.length;
  const sorted: number[] = [];
  let step = 0;

  snapshots.push(createArraySnapshot(step++, 1, [...arr], 'Initial array'));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      snapshots.push(
        createArraySnapshot(step++, 3, [...arr], `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`, {
          comparing: [j, j + 1],
          sorted: [...sorted],
        })
      );

      if (arr[j] > arr[j + 1]) {
        snapshots.push(
          createArraySnapshot(step++, 4, [...arr], `Swapping ${arr[j]} and ${arr[j + 1]}`, {
            swapping: [j, j + 1],
            sorted: [...sorted],
          })
        );

        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        snapshots.push(
          createArraySnapshot(step++, 5, [...arr], `Swapped: [${arr.join(', ')}]`, {
            sorted: [...sorted],
          })
        );
      }
    }
    sorted.unshift(n - i - 1);
    snapshots.push(
      createArraySnapshot(step++, 7, [...arr], `Element ${arr[n - i - 1]} is now sorted at position ${n - i - 1}`, {
        sorted: [...sorted],
      })
    );
  }
  sorted.unshift(0);
  snapshots.push(
    createArraySnapshot(step++, 9, [...arr], 'Array sorted!', {
      sorted: Array.from({ length: n }, (_, i) => i),
    })
  );

  return snapshots;
}

export function selectionSortSnapshots(input?: number[]): StateSnapshot[] {
  const arr = input ?? generateRandomArray(15);
  const snapshots: StateSnapshot[] = [];
  const n = arr.length;
  const sorted: number[] = [];
  let step = 0;

  snapshots.push(createArraySnapshot(step++, 1, [...arr], 'Initial array'));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    snapshots.push(
      createArraySnapshot(step++, 3, [...arr], `Looking for minimum from position ${i}`, {
        comparing: [i, i],
        sorted: [...sorted],
        pivot: i,
      })
    );

    for (let j = i + 1; j < n; j++) {
      snapshots.push(
        createArraySnapshot(step++, 5, [...arr], `Comparing arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}`, {
          comparing: [minIdx, j],
          sorted: [...sorted],
          pivot: i,
        })
      );

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        snapshots.push(
          createArraySnapshot(step++, 6, [...arr], `New minimum: arr[${minIdx}]=${arr[minIdx]}`, {
            pivot: i,
            sorted: [...sorted],
          })
        );
      }
    }

    if (minIdx !== i) {
      snapshots.push(
        createArraySnapshot(step++, 8, [...arr], `Swapping arr[${i}]=${arr[i]} with arr[${minIdx}]=${arr[minIdx]}`, {
          swapping: [i, minIdx],
          sorted: [...sorted],
        })
      );
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }

    sorted.push(i);
    snapshots.push(
      createArraySnapshot(step++, 10, [...arr], `Position ${i} sorted with value ${arr[i]}`, {
        sorted: [...sorted],
      })
    );
  }
  sorted.push(n - 1);
  snapshots.push(
    createArraySnapshot(step++, 12, [...arr], 'Array sorted!', {
      sorted: Array.from({ length: n }, (_, i) => i),
    })
  );

  return snapshots;
}

export function insertionSortSnapshots(input?: number[]): StateSnapshot[] {
  const arr = input ?? generateRandomArray(15);
  const snapshots: StateSnapshot[] = [];
  const n = arr.length;
  const sorted: number[] = [0];
  let step = 0;

  snapshots.push(createArraySnapshot(step++, 1, [...arr], 'Initial array (first element is sorted)'));

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    snapshots.push(
      createArraySnapshot(step++, 3, [...arr], `Taking key = arr[${i}] = ${key}`, {
        pivot: i,
        sorted: [...sorted],
      })
    );

    while (j >= 0 && arr[j] > key) {
      snapshots.push(
        createArraySnapshot(step++, 5, [...arr], `Comparing key=${key} with arr[${j}]=${arr[j]}, shifting right`, {
          comparing: [j, j + 1],
          pivot: j + 1,
          sorted: [...sorted],
        })
      );

      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;
    sorted.push(i);
    snapshots.push(
      createArraySnapshot(step++, 8, [...arr], `Placed ${key} at position ${j + 1}`, {
        sorted: [...sorted],
      })
    );
  }

  snapshots.push(
    createArraySnapshot(step++, 10, [...arr], 'Array sorted!', {
      sorted: Array.from({ length: n }, (_, i) => i),
    })
  );

  return snapshots;
}

export function quickSortSnapshots(input?: number[]): StateSnapshot[] {
  const arr = input ?? generateRandomArray(12);
  const snapshots: StateSnapshot[] = [];
  const sorted = new Set<number>();
  let step = 0;

  snapshots.push(createArraySnapshot(step++, 1, [...arr], 'Initial array'));

  function quickSort(low: number, high: number) {
    if (low >= high) {
      if (low === high) sorted.add(low);
      return;
    }

    const pivot = arr[high];
    snapshots.push(
      createArraySnapshot(step++, 4, [...arr], `Pivot = arr[${high}] = ${pivot}`, {
        pivot: high,
        sorted: Array.from(sorted),
      })
    );

    let i = low - 1;
    for (let j = low; j < high; j++) {
      snapshots.push(
        createArraySnapshot(step++, 6, [...arr], `Comparing arr[${j}]=${arr[j]} with pivot=${pivot}`, {
          comparing: [j, high],
          pivot: high,
          sorted: Array.from(sorted),
        })
      );

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          snapshots.push(
            createArraySnapshot(step++, 8, [...arr], `Swapping arr[${i}] and arr[${j}]`, {
              swapping: [i, j],
              pivot: high,
              sorted: Array.from(sorted),
            })
          );
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
    }

    if (i + 1 !== high) {
      snapshots.push(
        createArraySnapshot(step++, 10, [...arr], `Placing pivot at correct position`, {
          swapping: [i + 1, high],
          sorted: Array.from(sorted),
        })
      );
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    }

    const pi = i + 1;
    sorted.add(pi);
    snapshots.push(
      createArraySnapshot(step++, 12, [...arr], `Pivot ${arr[pi]} is now at correct position ${pi}`, {
        pivot: pi,
        sorted: Array.from(sorted),
      })
    );

    quickSort(low, pi - 1);
    quickSort(pi + 1, high);
  }

  quickSort(0, arr.length - 1);
  snapshots.push(
    createArraySnapshot(step++, 14, [...arr], 'Array sorted!', {
      sorted: Array.from({ length: arr.length }, (_, i) => i),
    })
  );

  return snapshots;
}

export function mergeSortSnapshots(input?: number[]): StateSnapshot[] {
  const arr = input ?? generateRandomArray(16);
  const snapshots: StateSnapshot[] = [];
  const sorted = new Set<number>();
  let step = 0;

  const visualArr = [...arr];

  snapshots.push(createArraySnapshot(step++, 1, [...visualArr], 'Initial array'));

  function mergeSortHelper(l: number, r: number, depth: number = 0): number[] {
    if (l === r) {
      sorted.add(l);
      return [visualArr[l]];
    }
    const m = Math.floor((l + r) / 2);

    snapshots.push(
      createArraySnapshot(step++, 4, [...visualArr], `Dividing [${l}..${r}] at midpoint ${m} (depth ${depth})`, {
        pivot: m,
        sorted: Array.from(sorted),
      })
    );

    const left = mergeSortHelper(l, m, depth + 1);
    const right = mergeSortHelper(m + 1, r, depth + 1);

    const merged: number[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      snapshots.push(
        createArraySnapshot(step++, 8, [...visualArr], `Merging: comparing ${left[i]} and ${right[j]}`, {
          comparing: [l + i, m + 1 + j],
          sorted: Array.from(sorted),
        })
      );

      if (left[i] <= right[j]) {
        merged.push(left[i]);
        i++;
      } else {
        merged.push(right[j]);
        j++;
      }
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);

    for (let k = 0; k < merged.length; k++) {
      visualArr[l + k] = merged[k];
      sorted.add(l + k);
    }

    snapshots.push(
      createArraySnapshot(step++, 12, [...visualArr], `Merged [${l}..${r}]: [${merged.join(', ')}]`, {
        sorted: Array.from(sorted),
      })
    );

    return merged;
  }

  mergeSortHelper(0, visualArr.length - 1);
  snapshots.push(
    createArraySnapshot(step++, 14, [...visualArr], 'Array sorted!', {
      sorted: Array.from({ length: visualArr.length }, (_, i) => i),
    })
  );

  return snapshots;
}

export function heapSortSnapshots(input?: number[]): StateSnapshot[] {
  const arr = input ?? generateRandomArray(14);
  const snapshots: StateSnapshot[] = [];
  const n = arr.length;
  const sorted: number[] = [];
  let step = 0;

  snapshots.push(createArraySnapshot(step++, 1, [...arr], 'Initial array'));

  function heapify(size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      snapshots.push(
        createArraySnapshot(step++, 5, [...arr], `Comparing arr[${largest}]=${arr[largest]} with left child arr[${left}]=${arr[left]}`, {
          comparing: [largest, left],
          sorted: Array.from({ length: n - size }, (_, i) => i),
        })
      );
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < size) {
      snapshots.push(
        createArraySnapshot(step++, 5, [...arr], `Comparing arr[${largest}]=${arr[largest]} with right child arr[${right}]=${arr[right]}`, {
          comparing: [largest, right],
          sorted: Array.from({ length: n - size }, (_, i) => i),
        })
      );
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== root) {
      snapshots.push(
        createArraySnapshot(step++, 7, [...arr], `Swapping arr[${root}] and arr[${largest}]`, {
          swapping: [root, largest],
          sorted: Array.from({ length: n - size }, (_, i) => i),
        })
      );
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  snapshots.push(createArraySnapshot(step++, 9, [...arr], 'Max heap built'));

  for (let i = n - 1; i > 0; i--) {
    snapshots.push(
      createArraySnapshot(step++, 11, [...arr], `Swapping root ${arr[0]} with arr[${i}]=${arr[i]}`, {
        swapping: [0, i],
        sorted: [...sorted],
      })
    );
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sorted.unshift(i);

    snapshots.push(
      createArraySnapshot(step++, 12, [...arr], `Element ${arr[i]} sorted at position ${i}`, {
        sorted: [...sorted],
      })
    );

    heapify(i, 0);
  }
  sorted.unshift(0);
  snapshots.push(
    createArraySnapshot(step++, 14, [...arr], 'Array sorted!', {
      sorted: Array.from({ length: n }, (_, i) => i),
    })
  );

  return snapshots;
}

function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}
