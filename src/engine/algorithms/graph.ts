import type { StateSnapshot, GraphState } from '../../types';

function createGraphSnapshot(
  step: number,
  line: number,
  graph: GraphState,
  description: string
): StateSnapshot {
  return { step, line, variables: [], description, graphState: graph };
}

const defaultGraph = (): GraphState => ({
  nodes: [
    { id: 'A', label: 'A', visited: false, current: false, distance: Infinity },
    { id: 'B', label: 'B', visited: false, current: false, distance: Infinity },
    { id: 'C', label: 'C', visited: false, current: false, distance: Infinity },
    { id: 'D', label: 'D', visited: false, current: false, distance: Infinity },
    { id: 'E', label: 'E', visited: false, current: false, distance: Infinity },
    { id: 'F', label: 'F', visited: false, current: false, distance: Infinity },
  ],
  edges: [
    { source: 'A', target: 'B', weight: 4, highlighted: false, inPath: false },
    { source: 'A', target: 'C', weight: 2, highlighted: false, inPath: false },
    { source: 'B', target: 'D', weight: 5, highlighted: false, inPath: false },
    { source: 'B', target: 'E', weight: 3, highlighted: false, inPath: false },
    { source: 'C', target: 'D', weight: 8, highlighted: false, inPath: false },
    { source: 'C', target: 'F', weight: 7, highlighted: false, inPath: false },
    { source: 'D', target: 'E', weight: 1, highlighted: false, inPath: false },
    { source: 'E', target: 'F', weight: 6, highlighted: false, inPath: false },
  ],
  currentNode: null,
  visitedNodes: [],
  pathNodes: [],
});

function cloneGraph(g: GraphState): GraphState {
  return {
    nodes: g.nodes.map((n) => ({ ...n })),
    edges: g.edges.map((e) => ({ ...e })),
    currentNode: g.currentNode,
    visitedNodes: [...g.visitedNodes],
    pathNodes: [...g.pathNodes],
  };
}

export function bfsGraphSnapshots(start?: string): StateSnapshot[] {
  const graph = defaultGraph();
  const snapshots: StateSnapshot[] = [];
  const s = start ?? 'A';
  let step = 0;

  snapshots.push(createGraphSnapshot(step++, 1, cloneGraph(graph), `Starting BFS from node ${s}`));

  const queue: string[] = [s];
  const visited = new Set<string>([s]);
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  nodeMap.get(s)!.visited = true;
  nodeMap.get(s)!.current = true;
  graph.currentNode = s;
  graph.visitedNodes = [s];

  snapshots.push(createGraphSnapshot(step++, 3, cloneGraph(graph), `Enqueued start node ${s}. Queue: [${s}]`));

  while (queue.length > 0) {
    const current = queue.shift()!;
    graph.currentNode = current;
    const curNode = nodeMap.get(current)!;
    curNode.current = true;

    snapshots.push(
      createGraphSnapshot(step++, 5, cloneGraph(graph), `Dequeued ${current}. Queue: [${queue.join(', ')}]`)
    );

    const neighbors = graph.edges
      .filter((e) => e.source === current || e.target === current)
      .map((e) => (e.source === current ? e.target : e.source));

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        const neighNode = nodeMap.get(neighbor)!;
        neighNode.visited = true;
        graph.visitedNodes = [...visited];

        const edge = graph.edges.find(
          (e) => (e.source === current && e.target === neighbor) || (e.source === neighbor && e.target === current)
        );
        if (edge) edge.highlighted = true;

        snapshots.push(
          createGraphSnapshot(step++, 7, cloneGraph(graph), `Discovered ${neighbor} from ${current}. Queue: [${queue.join(', ')}]`)
        );

        if (edge) edge.highlighted = false;
      }
    }
    curNode.current = false;
  }

  graph.currentNode = null;
  snapshots.push(createGraphSnapshot(step++, 9, cloneGraph(graph), `BFS complete! Visited order: ${[...visited].join(' → ')}`));

  return snapshots;
}

export function dfsGraphSnapshots(start?: string): StateSnapshot[] {
  const graph = defaultGraph();
  const snapshots: StateSnapshot[] = [];
  const s = start ?? 'A';
  let step = 0;
  const visited = new Set<string>();
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  snapshots.push(createGraphSnapshot(step++, 1, cloneGraph(graph), `Starting DFS from node ${s}`));

  function dfs(nodeId: string) {
    visited.add(nodeId);
    const node = nodeMap.get(nodeId)!;
    node.visited = true;
    node.current = true;
    graph.currentNode = nodeId;
    graph.visitedNodes = [...visited];

    snapshots.push(
      createGraphSnapshot(step++, 4, cloneGraph(graph), `Visiting node ${nodeId}. Visited: [${[...visited].join(', ')}]`)
    );

    const neighbors = graph.edges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .map((e) => (e.source === nodeId ? e.target : e.source));

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const edge = graph.edges.find(
          (e) => (e.source === nodeId && e.target === neighbor) || (e.source === neighbor && e.target === nodeId)
        );
        if (edge) edge.highlighted = true;

        snapshots.push(
          createGraphSnapshot(step++, 6, cloneGraph(graph), `Exploring edge ${nodeId} → ${neighbor}`)
        );

        if (edge) edge.highlighted = false;
        dfs(neighbor);
      }
    }

    node.current = false;
    graph.currentNode = null;
  }

  dfs(s);
  snapshots.push(createGraphSnapshot(step++, 8, cloneGraph(graph), `DFS complete! Visited order: ${[...visited].join(' → ')}`));

  return snapshots;
}

export function dijkstraSnapshots(start?: string, end?: string): StateSnapshot[] {
  const graph = defaultGraph();
  const snapshots: StateSnapshot[] = [];
  const s = start ?? 'A';
  const e = end ?? 'F';
  let step = 0;

  snapshots.push(createGraphSnapshot(step++, 1, cloneGraph(graph), `Starting Dijkstra from ${s} to ${e}`));

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const node of graph.nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }
  distances.set(s, 0);
  nodeMap.get(s)!.distance = 0;
  nodeMap.get(s)!.current = true;
  graph.currentNode = s;

  snapshots.push(
    createGraphSnapshot(step++, 3, cloneGraph(graph), `Initialized distances: ${s}=0, others=∞`)
  );

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      const d = distances.get(id)!;
      if (d < minDist) { minDist = d; current = id; }
    }
    if (current === null || distances.get(current) === Infinity) break;

    unvisited.delete(current);
    const curNode = nodeMap.get(current)!;
    curNode.visited = true;
    curNode.current = true;
    graph.currentNode = current;
    graph.visitedNodes = [...graph.visitedNodes, current];

    snapshots.push(
      createGraphSnapshot(step++, 6, cloneGraph(graph), `Selected node ${current} (distance=${distances.get(current)})`)
    );

    if (current === e) break;

    const neighbors = graph.edges
      .filter((ed) => ed.source === current || ed.target === current)
      .map((ed) => ({ neighbor: ed.source === current ? ed.target : ed.source, weight: ed.weight, edge: ed }));

    for (const { neighbor, weight, edge } of neighbors) {
      if (!unvisited.has(neighbor)) continue;
      edge.highlighted = true;
      const alt = distances.get(current)! + weight;

      snapshots.push(
        createGraphSnapshot(step++, 8, cloneGraph(graph), `Checking ${current}→${neighbor}: ${distances.get(current)} + ${weight} = ${alt} vs ${distances.get(neighbor)}`)
      );

      if (alt < distances.get(neighbor)!) {
        distances.set(neighbor, alt);
        previous.set(neighbor, current);
        nodeMap.get(neighbor)!.distance = alt;

        snapshots.push(
          createGraphSnapshot(step++, 9, cloneGraph(graph), `Updated distance to ${neighbor} = ${alt}`)
        );
      }
      edge.highlighted = false;
    }
    curNode.current = false;
  }

  const path: string[] = [];
  let curr: string | null = e;
  while (curr) { path.unshift(curr); curr = previous.get(curr) ?? null; }
  graph.pathNodes = path;

  for (let i = 0; i < path.length - 1; i++) {
    const ed = graph.edges.find(
      (edg) => (edg.source === path[i] && edg.target === path[i + 1]) || (edg.source === path[i + 1] && edg.target === path[i])
    );
    if (ed) ed.inPath = true;
  }

  graph.currentNode = null;
  snapshots.push(
    createGraphSnapshot(step++, 11, cloneGraph(graph), `Shortest path found: ${path.join(' → ')} (distance=${distances.get(e)})`)
  );

  return snapshots;
}
