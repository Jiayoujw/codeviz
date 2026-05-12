import type { StateSnapshot } from '../types';
import { bubbleSortSnapshots, selectionSortSnapshots, insertionSortSnapshots, quickSortSnapshots, mergeSortSnapshots, heapSortSnapshots } from './algorithms/sorting';
import { bstInsertSnapshots, dfsTraversalSnapshots, bfsTraversalSnapshots, avlInsertSnapshots } from './algorithms/tree';
import { bfsGraphSnapshots, dfsGraphSnapshots, dijkstraSnapshots } from './algorithms/graph';
import { linkedListInsertHeadSnapshots, linkedListDeleteSnapshots, linkedListReverseSnapshots } from './algorithms/linkedlist';
import type { AlgorithmType } from '../types';

export interface RunAlgorithmOptions {
  algorithm: AlgorithmType;
  data?: {
    array?: number[];
    treeValues?: number[];
    treeSearchValue?: number;
    graphNodes?: string[];
    graphEdges?: [string, string, number][];
    graphStart?: string;
    graphEnd?: string;
    llValues?: number[];
    llInsertValue?: number;
    llDeleteValue?: number;
  };
}

export function runAlgorithm(options: RunAlgorithmOptions): StateSnapshot[] {
  const { algorithm, data } = options;
  switch (algorithm) {
    case 'bubbleSort':
      return bubbleSortSnapshots(data?.array);
    case 'selectionSort':
      return selectionSortSnapshots(data?.array);
    case 'insertionSort':
      return insertionSortSnapshots(data?.array);
    case 'mergeSort':
      return mergeSortSnapshots(data?.array);
    case 'quickSort':
      return quickSortSnapshots(data?.array);
    case 'heapSort':
      return heapSortSnapshots(data?.array);
    case 'bstInsert':
      return bstInsertSnapshots(data?.treeValues);
    case 'bstSearch':
      return dfsTraversalSnapshots(data?.treeValues?.[0]);
    case 'dfsTree':
      return dfsTraversalSnapshots(data?.treeValues?.[0]);
    case 'bfsTree':
      return bfsTraversalSnapshots(data?.treeValues?.[0]);
    case 'avlInsert':
      return avlInsertSnapshots(data?.treeValues);
    case 'bfsGraph':
      return bfsGraphSnapshots(data?.graphStart);
    case 'dfsGraph':
      return dfsGraphSnapshots(data?.graphStart);
    case 'dijkstra':
      return dijkstraSnapshots(data?.graphStart, data?.graphEnd);
    case 'llInsertHead':
      return linkedListInsertHeadSnapshots(data?.llValues, data?.llInsertValue);
    case 'llDelete':
      return linkedListDeleteSnapshots(data?.llValues, data?.llDeleteValue);
    case 'llReverse':
      return linkedListReverseSnapshots(data?.llValues);
    default:
      return [];
  }
}

export function runUserCode(_code: string): StateSnapshot[] {
  return [];
}
