import { useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { useEditorStore } from '../../store/editorStore';
import { runAlgorithm } from '../../engine/interpreter';
import type { AlgorithmType, AlgorithmTemplate } from '../../types';

const templates: AlgorithmTemplate[] = [
  // Sorting
  { id: 'bubbleSort', name: 'Bubble Sort', category: 'array', code: 'bubbleSort(arr)', description: 'Compare adjacent elements and swap', icon: '🫧' },
  { id: 'selectionSort', name: 'Selection Sort', category: 'array', code: 'selectionSort(arr)', description: 'Find minimum and place at front', icon: '🎯' },
  { id: 'insertionSort', name: 'Insertion Sort', category: 'array', code: 'insertionSort(arr)', description: 'Build sorted array one by one', icon: '📥' },
  { id: 'quickSort', name: 'Quick Sort', category: 'array', code: 'quickSort(arr)', description: 'Divide & conquer with pivot', icon: '⚡' },
  { id: 'mergeSort', name: 'Merge Sort', category: 'array', code: 'mergeSort(arr)', description: 'Split, sort, and merge', icon: '🔀' },
  { id: 'heapSort', name: 'Heap Sort', category: 'array', code: 'heapSort(arr)', description: 'Max-heap based sorting', icon: '🏔️' },
  // Trees
  { id: 'bstInsert', name: 'BST Insert', category: 'tree', code: 'bst.insert(values)', description: 'Build a binary search tree', icon: '🌳' },
  { id: 'dfsTree', name: 'DFS Traversal', category: 'tree', code: 'dfs(root)', description: 'Depth-first: pre/in/post order', icon: '🔍' },
  { id: 'bfsTree', name: 'BFS Traversal', category: 'tree', code: 'bfs(root)', description: 'Level-order traversal', icon: '📊' },
  { id: 'avlInsert', name: 'AVL Insert', category: 'tree', code: 'avl.insert(values)', description: 'Self-balancing BST insertions', icon: '⚖️' },
  // Graphs
  { id: 'bfsGraph', name: 'BFS Graph', category: 'graph', code: 'bfs(graph, start)', description: 'Breadth-first search on graph', icon: '🌐' },
  { id: 'dfsGraph', name: 'DFS Graph', category: 'graph', code: 'dfs(graph, start)', description: 'Depth-first search on graph', icon: '🗺️' },
  { id: 'dijkstra', name: 'Dijkstra', category: 'graph', code: 'dijkstra(graph, start, end)', description: 'Shortest path with Dijkstra', icon: '📍' },
  // Linked List
  { id: 'llInsertHead', name: 'Insert Head', category: 'linkedlist', code: 'll.insertHead(val)', description: 'Insert node at head', icon: '🔗' },
  { id: 'llDelete', name: 'Delete Node', category: 'linkedlist', code: 'll.delete(val)', description: 'Remove node by value', icon: '✂️' },
  { id: 'llReverse', name: 'Reverse List', category: 'linkedlist', code: 'll.reverse()', description: 'Reverse linked list in-place', icon: '🔄' },
];

export function TemplateList() {
  const setVisualizationType = useVisualizerStore((s) => s.setVisualizationType);
  const setSnapshots = useVisualizerStore((s) => s.setSnapshots);
  const setCurrentSnapshot = useVisualizerStore((s) => s.setCurrentSnapshot);
  const setCode = useEditorStore((s) => s.setCode);
  const playback = usePlaybackStore();

  const handleSelect = useCallback((template: AlgorithmTemplate) => {
    playback.reset();
    setVisualizationType(template.category);
    setCode(template.code);

    const snapshots = runAlgorithm({ algorithm: template.id as AlgorithmType });
    setSnapshots(snapshots);
    playback.setTotalSteps(snapshots.length);

    if (snapshots.length > 0) {
      setCurrentSnapshot(snapshots[0]);
    }
  }, [setVisualizationType, setSnapshots, setCurrentSnapshot, setCode, playback]);

  const categories = [
    { key: 'array', label: '📊 SORTING', color: 'var(--color-neon-pink)' },
    { key: 'tree', label: '🌳 TREE STRUCTURES', color: 'var(--color-neon-green)' },
    { key: 'graph', label: '🌐 GRAPH ALGORITHMS', color: 'var(--color-neon-cyan)' },
    { key: 'linkedlist', label: '🔗 LINKED LISTS', color: 'var(--color-neon-purple)' },
  ];

  return (
    <div className="py-3">
      <div className="px-3 mb-3">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider">
          ALGORITHMS
        </h2>
      </div>

      {categories.map((cat) => {
        const catTemplates = templates.filter((t) => t.category === cat.key);
        return (
          <div key={cat.key} className="mb-4">
            <div
              className="px-3 py-1.5 text-[10px] font-bold tracking-widest mb-1"
              style={{ color: cat.color }}
            >
              {cat.label}
            </div>
            {catTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface-3)] transition-colors border-l-2 border-transparent hover:border-[var(--color-neon-cyan)] group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.icon}</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{t.name}</span>
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 ml-6">
                  {t.description}
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
