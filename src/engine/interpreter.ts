import type * as acorn from 'acorn';
import type { StateSnapshot } from '../types';
import { bubbleSortSnapshots, selectionSortSnapshots, insertionSortSnapshots, quickSortSnapshots, mergeSortSnapshots, heapSortSnapshots } from './algorithms/sorting';
import { bstInsertSnapshots, dfsTraversalSnapshots, bfsTraversalSnapshots, avlInsertSnapshots } from './algorithms/tree';
import { bfsGraphSnapshots, dfsGraphSnapshots, dijkstraSnapshots } from './algorithms/graph';
import { linkedListInsertHeadSnapshots, linkedListDeleteSnapshots, linkedListReverseSnapshots } from './algorithms/linkedlist';
import { astarSnapshots } from './algorithms/astar';
import { fibonacciSnapshots, knapsackSnapshots, binarySearchSnapshots } from './algorithms/dp';
import { parseCode } from './parser';
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
    case 'astar':
      return astarSnapshots();
    case 'fibonacci':
      return fibonacciSnapshots();
    case 'knapsack':
      return knapsackSnapshots();
    case 'binarySearch':
      return binarySearchSnapshots();
    default:
      return [];
  }
}

interface ParsedCall {
  algorithm: AlgorithmType;
  extra?: {
    array?: number[];
    treeValues?: number[];
    graphStart?: string;
    graphEnd?: string;
    llValues?: number[];
    llInsertValue?: number;
    llDeleteValue?: number;
  };
}

// Map function names from user code to AlgorithmType
const FUNCTION_ALGO_MAP: Record<string, AlgorithmType> = {
  bubbleSort: 'bubbleSort',
  selectionSort: 'selectionSort',
  insertionSort: 'insertionSort',
  quickSort: 'quickSort',
  mergeSort: 'mergeSort',
  heapSort: 'heapSort',
  binarySearch: 'binarySearch',
  dfs: 'dfsTree',
  bfs: 'bfsTree',
  dijkstra: 'dijkstra',
  astar: 'astar',
  fibonacci: 'fibonacci',
  knapsack: 'knapsack',
};

// Method-style calls like bst.insert(), ll.insertHead()
interface MethodMapEntry {
  algo: AlgorithmType;
  argField: string;
}
const METHOD_ALGO_MAP: Record<string, Record<string, MethodMapEntry>> = {
  bst: { insert: { algo: 'bstInsert', argField: 'treeValues' } },
  avl: { insert: { algo: 'avlInsert', argField: 'treeValues' } },
  ll: {
    insertHead: { algo: 'llInsertHead', argField: 'llInsertValue' },
    delete: { algo: 'llDelete', argField: 'llDeleteValue' },
    reverse: { algo: 'llReverse', argField: '' },
  },
};

function evalLiteral(node: acorn.Node): unknown {
  const n = node as acorn.Node & { value?: unknown; elements?: acorn.Node[] };
  if (n.type === 'Literal') return n.value;
  if (n.type === 'ArrayExpression' && n.elements) {
    return n.elements.map((el) => evalLiteral(el));
  }
  if (n.type === 'UnaryExpression') {
    const u = node as acorn.Node & { argument: acorn.Node; operator: string };
    const arg = evalLiteral(u.argument) as number;
    return u.operator === '-' ? -arg : arg;
  }
  return undefined;
}

function walkCalls(node: acorn.Node, calls: ParsedCall[]): void {
  const n = node as acorn.Node & Record<string, unknown>;

  if (n.type === 'CallExpression') {
    const callee = n.callee as acorn.Node & { type: string; name?: string; object?: acorn.Node; property?: acorn.Node };
    const args = (n.arguments as acorn.Node[]) ?? [];

    // Direct function call: bubbleSort([...])
    if (callee.type === 'Identifier' && callee.name) {
      const algo = FUNCTION_ALGO_MAP[callee.name];
      if (algo) {
        const parsed: ParsedCall = { algorithm: algo };
        const firstArg = evalLiteral(args[0]);
        if (Array.isArray(firstArg)) {
          if (algo === 'binarySearch') {
            // binarySearch(arr, target)
            parsed.extra = { array: firstArg as number[] };
          } else {
            parsed.extra = { array: firstArg as number[] };
          }
        }
        calls.push(parsed);
      }
    }

    // Method call: bst.insert([...]), ll.insertHead(5)
    if (callee.type === 'MemberExpression' && callee.object && callee.property) {
      const obj = callee.object as acorn.Node & { name?: string };
      const prop = callee.property as acorn.Node & { name?: string };
      if (obj.name && prop.name) {
        const methodMap = METHOD_ALGO_MAP[obj.name];
        if (methodMap) {
          const entry = methodMap[prop.name];
          if (entry) {
            const parsed: ParsedCall = { algorithm: entry.algo, extra: {} };
            const firstArg = evalLiteral(args[0]);
            if (entry.argField === 'treeValues' || entry.argField === 'llValues') {
              (parsed.extra as Record<string, unknown>)[entry.argField] = firstArg;
            } else if (entry.argField === 'llInsertValue' || entry.argField === 'llDeleteValue') {
              (parsed.extra as Record<string, unknown>)[entry.argField] = typeof firstArg === 'number' ? firstArg : undefined;
            }
            calls.push(parsed);
          }
        }
      }
    }
  }

  // Recurse into children
  for (const key of Object.keys(n)) {
    const val = n[key];
    if (val && typeof val === 'object' && 'type' in (val as object)) {
      walkCalls(val as unknown as acorn.Node, calls);
    } else if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object' && 'type' in item) {
          walkCalls(item as unknown as acorn.Node, calls);
        }
      }
    }
  }
}

export function runUserCode(code: string): StateSnapshot[] {
  const { ast, error } = parseCode(code);
  if (error || !ast) return [];

  const calls: ParsedCall[] = [];
  walkCalls(ast as unknown as acorn.Node, calls);

  const results: StateSnapshot[] = [];
  for (const call of calls) {
    const snapshots = runAlgorithm({
      algorithm: call.algorithm,
      data: {
        array: call.extra?.array,
        treeValues: call.extra?.treeValues,
        graphStart: call.extra?.graphStart,
        graphEnd: call.extra?.graphEnd,
        llValues: call.extra?.llValues,
        llInsertValue: call.extra?.llInsertValue,
        llDeleteValue: call.extra?.llDeleteValue,
      },
    });
    results.push(...snapshots);
  }
  return results;
}
