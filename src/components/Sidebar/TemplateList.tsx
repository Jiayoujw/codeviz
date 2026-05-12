import { useCallback, useState, useMemo } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { useEditorStore } from '../../store/editorStore';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';
import { runAlgorithm } from '../../engine/interpreter';
import type { AlgorithmType, AlgorithmTemplate } from '../../types';

type Difficulty = 'easy' | 'medium' | 'hard';

const templateDefs: {
  id: AlgorithmType;
  category: string;
  vizType: string;
  difficulty: Difficulty;
  code: string;
}[] = [
  // Sorting
  { id: 'bubbleSort', category: 'sorting', vizType: 'array', difficulty: 'easy', code: 'bubbleSort([64,34,25,12,22,11,90])' },
  { id: 'selectionSort', category: 'sorting', vizType: 'array', difficulty: 'easy', code: 'selectionSort([64,34,25,12,22,11,90])' },
  { id: 'insertionSort', category: 'sorting', vizType: 'array', difficulty: 'easy', code: 'insertionSort([64,34,25,12,22,11,90])' },
  { id: 'quickSort', category: 'sorting', vizType: 'array', difficulty: 'medium', code: 'quickSort([33,10,59,26,41,15,70])' },
  { id: 'mergeSort', category: 'sorting', vizType: 'array', difficulty: 'medium', code: 'mergeSort([38,27,43,3,9,82,10])' },
  { id: 'heapSort', category: 'sorting', vizType: 'array', difficulty: 'medium', code: 'heapSort([12,11,13,5,6,7])' },
  // Search
  { id: 'binarySearch', category: 'search', vizType: 'array', difficulty: 'easy', code: 'binarySearch(arr, 23) // 二分查找' },
  // Trees
  { id: 'bstInsert', category: 'tree', vizType: 'tree', difficulty: 'medium', code: 'bst.insert([50,30,70,20,40,60,80])' },
  { id: 'dfsTree', category: 'tree', vizType: 'tree', difficulty: 'easy', code: 'dfs(root) // 深度优先遍历' },
  { id: 'bfsTree', category: 'tree', vizType: 'tree', difficulty: 'easy', code: 'bfs(root) // 广度优先遍历' },
  { id: 'avlInsert', category: 'tree', vizType: 'tree', difficulty: 'hard', code: 'avl.insert([30,20,40,10,25,5,15])' },
  // Graphs
  { id: 'bfsGraph', category: 'graph', vizType: 'graph', difficulty: 'medium', code: 'bfs(graph, "A") // BFS遍历' },
  { id: 'dfsGraph', category: 'graph', vizType: 'graph', difficulty: 'medium', code: 'dfs(graph, "A") // DFS遍历' },
  { id: 'dijkstra', category: 'graph', vizType: 'graph', difficulty: 'hard', code: 'dijkstra(graph, "A", "F") // 最短路径' },
  // Pathfinding
  { id: 'astar', category: 'search', vizType: 'grid', difficulty: 'hard', code: 'astar(maze, start, end) // A*寻路' },
  // DP
  { id: 'fibonacci', category: 'dp', vizType: 'dp', difficulty: 'easy', code: 'fibonacci(10) // 斐波那契DP' },
  { id: 'knapsack', category: 'dp', vizType: 'dp', difficulty: 'medium', code: 'knapsack(weights, values, 8) // 01背包' },
  // Linked List
  { id: 'llInsertHead', category: 'linkedlist', vizType: 'linkedlist', difficulty: 'easy', code: 'll.insertHead(5) // 头插' },
  { id: 'llDelete', category: 'linkedlist', vizType: 'linkedlist', difficulty: 'easy', code: 'll.delete(30) // 按值删除' },
  { id: 'llReverse', category: 'linkedlist', vizType: 'linkedlist', difficulty: 'medium', code: 'll.reverse() // 反转链表' },
];

const difficultyConfig: Record<Difficulty, { color: string; glow: string }> = {
  easy: { color: '#39ff14', glow: '0 0 6px #39ff1433' },
  medium: { color: '#ffe600', glow: '0 0 6px #ffe60033' },
  hard: { color: '#ff2d78', glow: '0 0 6px #ff2d7833' },
};

const categoryConfig: Record<string, { color: string; icon: string }> = {
  sorting: { color: 'var(--color-neon-pink)', icon: '📊' },
  search: { color: 'var(--color-neon-orange)', icon: '🔍' },
  tree: { color: 'var(--color-neon-green)', icon: '🌳' },
  graph: { color: 'var(--color-neon-cyan)', icon: '🌐' },
  linkedlist: { color: 'var(--color-neon-purple)', icon: '🔗' },
  dp: { color: 'var(--color-neon-yellow)', icon: '🎯' },
};

export function TemplateList() {
  const setVisualizationType = useVisualizerStore((s) => s.setVisualizationType);
  const setSnapshots = useVisualizerStore((s) => s.setSnapshots);
  const setCurrentSnapshot = useVisualizerStore((s) => s.setCurrentSnapshot);
  const setCode = useEditorStore((s) => s.setCode);
  const playback = usePlaybackStore();
  const lang = useLangStore((s) => s.lang);
  const tr = getTranslations(lang);

  const [filter, setFilter] = useState<Difficulty | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return templateDefs.filter((t) => {
      const algoT = tr.algorithms[t.id as keyof typeof tr.algorithms] as { name: string; desc: string; difficulty: string } | undefined;
      if (!algoT) return true;
      if (filter !== 'all' && t.difficulty !== filter) return false;
      if (search && !algoT.name.toLowerCase().includes(search.toLowerCase()) && !algoT.desc.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search, tr]);

  const templates: AlgorithmTemplate[] = useMemo(() => {
    return filtered.map((t) => {
      const algoT = tr.algorithms[t.id as keyof typeof tr.algorithms] as { name: string; desc: string; difficulty: string } | undefined;
      return {
        id: t.id,
        name: algoT?.name ?? t.id,
        category: (t.vizType as 'array' | 'tree' | 'graph' | 'linkedlist' | 'grid' | 'dp'),
        code: t.code,
        description: algoT?.desc ?? '',
        icon: categoryConfig[t.category]?.icon ?? '',
        difficulty: t.difficulty,
      };
    });
  }, [filtered, tr]);

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

  return (
    <div className="py-3">
      <div className="px-3 mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider">
          {lang === 'zh-CN' ? '算法' : 'ALGORITHMS'}
        </h2>
        <span className="text-[10px] text-[var(--color-text-secondary)]">{filtered.length}</span>
      </div>

      {/* Search */}
      <div className="px-3 mb-3">
        <input
          type="text"
          placeholder={lang === 'zh-CN' ? '搜索算法...' : 'Search algorithms...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-neon-cyan)] transition-colors"
        />
      </div>

      {/* Difficulty filter */}
      <div className="px-3 mb-3 flex gap-1.5">
        {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-2 py-0.5 text-[10px] rounded-full transition-all ${
              filter === d
                ? d === 'all'
                  ? 'bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] border border-[var(--color-neon-cyan)]'
                  : 'border text-white'
                : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-neon-cyan)]'
            }`}
            style={filter === d && d !== 'all' ? {
              borderColor: difficultyConfig[d].color,
              backgroundColor: difficultyConfig[d].color + '22',
              color: difficultyConfig[d].color,
            } : undefined}
          >
            {d === 'all' ? (lang === 'zh-CN' ? '全部' : 'All') : tr.difficulty[d]}
          </button>
        ))}
      </div>

      {/* Category sections */}
      {['sorting', 'search', 'tree', 'graph', 'dp', 'linkedlist'].map((cat) => {
        const catTemplates = templates.filter((t) => {
          const catMap: Record<string, string> = { sorting: 'array', search: 'array', tree: 'tree', graph: 'graph', dp: 'dp', linkedlist: 'linkedlist' };
          return t.category === catMap[cat];
        });
        if (catTemplates.length === 0) return null;

        const cfg = categoryConfig[cat];
        // Look up translated category name
        const catKey = cat as keyof typeof tr.categories;

        return (
          <div key={cat} className="mb-4">
            <div
              className="px-3 py-1.5 text-[10px] font-bold tracking-widest mb-1"
              style={{ color: cfg.color }}
            >
              {cfg.icon} {tr.categories[catKey]}
            </div>
            {catTemplates.map((t) => {
              const diff = t.difficulty as Difficulty | undefined;
              const dc = diff ? difficultyConfig[diff] : difficultyConfig.easy;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface-3)] transition-colors border-l-2 border-transparent hover:border-[var(--color-neon-cyan)] group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{t.icon}</span>
                    <span className="text-xs font-medium text-[var(--color-text-primary)] flex-1">{t.name}</span>
                    {diff && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          color: dc.color,
                          backgroundColor: dc.color + '18',
                          border: `1px solid ${dc.color}33`,
                        }}
                      >
                        {tr.difficulty[diff]}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 ml-6">
                    {t.description}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
