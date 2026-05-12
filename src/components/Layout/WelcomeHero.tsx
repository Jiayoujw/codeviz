import { useCallback } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { useEditorStore } from '../../store/editorStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import { runAlgorithm } from '../../engine/interpreter';
import type { AlgorithmType } from '../../types';

interface QuickCard {
  id: AlgorithmType;
  icon: string;
  color: string;
}

const quickCards: QuickCard[] = [
  { id: 'quickSort', icon: '📊', color: 'var(--color-neon-pink)' },
  { id: 'dijkstra', icon: '🌐', color: 'var(--color-neon-cyan)' },
  { id: 'bstInsert', icon: '🌳', color: 'var(--color-neon-green)' },
  { id: 'astar', icon: '🎯', color: 'var(--color-neon-yellow)' },
];

const cardColors = [
  { border: 'rgba(255,45,120,0.4)', bg: 'rgba(255,45,120,0.06)', glow: 'rgba(255,45,120,0.15)' },
  { border: 'rgba(0,245,255,0.4)', bg: 'rgba(0,245,255,0.06)', glow: 'rgba(0,245,255,0.15)' },
  { border: 'rgba(57,255,20,0.4)', bg: 'rgba(57,255,20,0.06)', glow: 'rgba(57,255,20,0.15)' },
  { border: 'rgba(255,230,0,0.4)', bg: 'rgba(255,230,0,0.06)', glow: 'rgba(255,230,0,0.15)' },
];

export function WelcomeHero() {
  const setVisualizationType = useVisualizerStore((s) => s.setVisualizationType);
  const setSnapshots = useVisualizerStore((s) => s.setSnapshots);
  const setCurrentSnapshot = useVisualizerStore((s) => s.setCurrentSnapshot);
  const setCode = useEditorStore((s) => s.setCode);
  const playback = usePlaybackStore();
  const lang = useLangStore((s) => s.lang);
  const tr = getTranslations(lang);

  const categoryMap: Record<string, 'array' | 'tree' | 'graph' | 'linkedlist' | 'grid' | 'dp'> = {
    quickSort: 'array', selectionSort: 'array', insertionSort: 'array',
    bubbleSort: 'array', mergeSort: 'array', heapSort: 'array', binarySearch: 'array',
    bstInsert: 'tree', dfsTree: 'tree', bfsTree: 'tree', avlInsert: 'tree',
    bfsGraph: 'graph', dfsGraph: 'graph', dijkstra: 'graph',
    llInsertHead: 'linkedlist', llDelete: 'linkedlist', llReverse: 'linkedlist',
    astar: 'grid', fibonacci: 'dp', knapsack: 'dp',
  };

  const handleCardClick = useCallback((id: AlgorithmType) => {
    const algoT = tr.algorithms[id as keyof typeof tr.algorithms] as { name: string; desc: string } | undefined;
    const name = algoT?.name ?? id;
    const code = `// ${name}\n${getTemplateCode(id)}`;
    playback.reset();
    setCode(code);
    setVisualizationType(categoryMap[id] ?? 'array');
    const snapshots = runAlgorithm({ algorithm: id });
    setSnapshots(snapshots);
    playback.setTotalSteps(snapshots.length);
    if (snapshots.length > 0) setCurrentSnapshot(snapshots[0]);
  }, [setVisualizationType, setSnapshots, setCurrentSnapshot, setCode, playback, tr]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Title */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-neon-cyan)] via-[var(--color-neon-purple)] to-[var(--color-neon-pink)] bg-clip-text text-transparent mb-2">
        CodeViz
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-10 text-center max-w-md">
        {lang === 'zh-CN'
          ? '交互式算法可视化学习平台 — 选择下方算法快速开始'
          : 'Interactive algorithm visualization platform — pick one to start'}
      </p>

      {/* Quick start cards */}
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full mb-10">
        {quickCards.map((card, i) => {
          const algoT = tr.algorithms[card.id as keyof typeof tr.algorithms] as { name: string; desc: string; difficulty: string } | undefined;
          const c = cardColors[i];
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="group relative p-5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5"
              style={{
                borderColor: c.border,
                backgroundColor: c.bg,
                boxShadow: `0 0 20px ${c.glow}`,
              }}
            >
              <span className="text-2xl block mb-2">{card.icon}</span>
              <div className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                {algoT?.name ?? card.id}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {algoT?.desc ?? ''}
              </div>
              <div
                className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ color: card.color, backgroundColor: card.color + '18' }}
              >
                {algoT?.difficulty ?? ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-xs text-[var(--color-text-secondary)] opacity-60">
        {lang === 'zh-CN'
          ? '← 从左侧选择更多算法模板    |    在右侧编辑器中改写代码 →'
          : '← More algorithms in the sidebar    |    Edit code in the right panel →'}
      </p>
    </div>
  );
}

function getTemplateCode(id: AlgorithmType): string {
  const map: Record<string, string> = {
    quickSort: 'quickSort([33,10,59,26,41,15,70])',
    dijkstra: 'dijkstra(graph, "A", "F")',
    bstInsert: 'bst.insert([50,30,70,20,40,60,80])',
    astar: 'astar(maze, start, end)',
    bubbleSort: 'bubbleSort([64,34,25,12,22,11,90])',
    selectionSort: 'selectionSort([64,34,25,12,22,11,90])',
    insertionSort: 'insertionSort([64,34,25,12,22,11,90])',
    mergeSort: 'mergeSort([38,27,43,3,9,82,10])',
    heapSort: 'heapSort([12,11,13,5,6,7])',
    binarySearch: 'binarySearch(arr, 23)',
    dfsTree: 'dfs(root)',
    bfsTree: 'bfs(root)',
    avlInsert: 'avl.insert([30,20,40,10,25,5,15])',
    bfsGraph: 'bfsGraph(graph, "A")',
    dfsGraph: 'dfsGraph(graph, "A")',
    llInsertHead: 'll.insertHead(5)',
    llDelete: 'll.delete(30)',
    llReverse: 'll.reverse()',
    fibonacci: 'fibonacci(10)',
    knapsack: 'knapsack(weights, values, 8)',
  };
  return map[id] ?? id;
}
