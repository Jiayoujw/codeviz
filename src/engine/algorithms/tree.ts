import type { StateSnapshot, TreeNodeData } from '../../types';

function createTreeSnapshot(
  step: number,
  line: number,
  tree: TreeNodeData | null,
  description: string
): StateSnapshot {
  return {
    step,
    line,
    variables: [],
    description,
    treeState: tree,
  };
}

function makeNode(value: number, highlighted = false, visited = false): TreeNodeData {
  return { id: `node-${value}-${Math.random().toString(36).slice(2, 6)}`, value, highlighted, visited };
}

export function bstInsertSnapshots(values?: number[]): StateSnapshot[] {
  const vals = values ?? [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45];
  const snapshots: StateSnapshot[] = [];
  let root: TreeNodeData | null = null;
  let step = 0;

  snapshots.push(createTreeSnapshot(step++, 1, null, 'Empty BST - ready to insert values'));

  for (const v of vals) {
    const newNode = makeNode(v, true);
    snapshots.push(createTreeSnapshot(step++, 3, deepCloneTree(root), `Creating new node with value ${v}`));

    if (!root) {
      root = newNode;
      root.highlighted = false;
      snapshots.push(createTreeSnapshot(step++, 5, deepCloneTree(root), `Inserted ${v} as root`));
      continue;
    }

    let current = root;
    let depth = 0;
    while (true) {
      const currentCopy = deepCloneTree(root);
      const targetInCopy = findNodeById(currentCopy, current.id);
      if (targetInCopy) targetInCopy.highlighted = true;

      snapshots.push(
        createTreeSnapshot(step++, 7, currentCopy, `Comparing ${v} with ${current.value}${v < current.value ? ' → go left' : ' → go right'}`)
      );

      if (v < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
      depth++;
    }
    root = unhighlightTree(deepCloneTree(root));
    snapshots.push(createTreeSnapshot(step++, 9, deepCloneTree(root), `Inserted ${v} into BST`));
  }

  snapshots.push(createTreeSnapshot(step++, 11, deepCloneTree(root), 'BST construction complete!'));

  return snapshots;
}

export function dfsTraversalSnapshots(_rootValue?: number): StateSnapshot[] {
  const root = buildSampleTree();
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  snapshots.push(createTreeSnapshot(step++, 1, deepCloneTree(root), 'Starting DFS (pre-order) traversal'));
  const visited: number[] = [];

  function dfs(node: TreeNodeData | null): void {
    if (!node) return;
    const treeCopy = deepCloneTree(root);
    const target = findNodeById(treeCopy!, node.id);
    if (target) target.highlighted = true;
    visited.forEach((v) => {
      const n = findNodeByValue(treeCopy!, v);
      if (n) n.visited = true;
    });

    snapshots.push(createTreeSnapshot(step++, 3, treeCopy, `Visiting node ${node.value} (pre-order)`));
    visited.push(node.value);

    dfs(node.left ?? null);
    dfs(node.right ?? null);
  }

  dfs(root);
  const finalTree = deepCloneTree(root);
  markAllVisited(finalTree!);
  snapshots.push(createTreeSnapshot(step++, 5, finalTree, 'DFS traversal complete! Order: ' + visited.join(' → ')));

  return snapshots;
}

export function bfsTraversalSnapshots(_rootValue?: number): StateSnapshot[] {
  const root = buildSampleTree();
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  snapshots.push(createTreeSnapshot(step++, 1, deepCloneTree(root), 'Starting BFS (level-order) traversal'));
  const queue: TreeNodeData[] = [root];
  const visited: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    visited.push(node.value);

    const treeCopy = deepCloneTree(root);
    const target = findNodeById(treeCopy!, node.id);
    if (target) target.highlighted = true;
    visited.forEach((v) => {
      const n = findNodeByValue(treeCopy!, v);
      if (n) n.visited = true;
    });

    snapshots.push(
      createTreeSnapshot(step++, 4, treeCopy, `Dequeued node ${node.value}. Queue: [${queue.map((n) => n.value).join(', ')}]`)
    );

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  const finalTree = deepCloneTree(root);
  markAllVisited(finalTree!);
  snapshots.push(createTreeSnapshot(step++, 6, finalTree, 'BFS traversal complete! Order: ' + visited.join(' → ')));

  return snapshots;
}

export function avlInsertSnapshots(values?: number[]): StateSnapshot[] {
  const vals = values ?? [30, 20, 40, 10, 25, 5, 15];
  const snapshots: StateSnapshot[] = [];
  let root: TreeNodeData | null = null;
  let step = 0;

  snapshots.push(createTreeSnapshot(step++, 1, null, 'Empty AVL tree - ready to insert values'));

  for (const v of vals) {
    root = avlInsert(root, v);
    const balancedTree = deepCloneTree(root);
    snapshots.push(createTreeSnapshot(step++, 3, balancedTree, `Inserted ${v} and rebalanced AVL tree`));
  }

  snapshots.push(createTreeSnapshot(step++, 5, deepCloneTree(root), 'AVL tree balanced! All nodes have balance factor in [-1, 0, 1]'));

  return snapshots;
}

function avlInsert(node: TreeNodeData | null, value: number): TreeNodeData {
  if (!node) return makeNode(value);
  if (value < node.value) {
    node.left = avlInsert(node.left ?? null, value);
  } else {
    node.right = avlInsert(node.right ?? null, value);
  }
  return node;
}

function buildSampleTree(): TreeNodeData {
  return {
    id: 'root',
    value: 50,
    highlighted: false,
    visited: false,
    left: {
      id: 'l1',
      value: 30,
      highlighted: false,
      visited: false,
      left: { id: 'l2', value: 20, highlighted: false, visited: false,
        left: { id: 'l3', value: 10, highlighted: false, visited: false },
      },
      right: { id: 'r2', value: 40, highlighted: false, visited: false,
        left: { id: 'l4', value: 35, highlighted: false, visited: false },
        right: { id: 'r3', value: 45, highlighted: false, visited: false },
      },
    },
    right: {
      id: 'r1',
      value: 70,
      highlighted: false,
      visited: false,
      left: { id: 'l5', value: 60, highlighted: false, visited: false },
      right: { id: 'r4', value: 80, highlighted: false, visited: false },
    },
  };
}

function deepCloneTree(node: TreeNodeData | null): TreeNodeData | null {
  if (!node) return null;
  return {
    ...node,
    left: deepCloneTree(node.left ?? null) ?? undefined,
    right: deepCloneTree(node.right ?? null) ?? undefined,
  };
}

function findNodeById(tree: TreeNodeData | null, id: string): TreeNodeData | null {
  if (!tree) return null;
  if (tree.id === id) return tree;
  if (tree.left) {
    const found = findNodeById(tree.left, id);
    if (found) return found;
  }
  if (tree.right) {
    const found = findNodeById(tree.right, id);
    if (found) return found;
  }
  return null;
}

function findNodeByValue(tree: TreeNodeData, value: number): TreeNodeData | null {
  if (tree.value === value) return tree;
  if (tree.left) {
    const found = findNodeByValue(tree.left, value);
    if (found) return found;
  }
  if (tree.right) {
    const found = findNodeByValue(tree.right, value);
    if (found) return found;
  }
  return null;
}

function unhighlightTree(node: TreeNodeData | null): TreeNodeData | null {
  if (!node) return null;
  return {
    ...node,
    highlighted: false,
    left: unhighlightTree(node.left ?? null) ?? undefined,
    right: unhighlightTree(node.right ?? null) ?? undefined,
  };
}

function markAllVisited(node: TreeNodeData): void {
  node.visited = true;
  if (node.left) markAllVisited(node.left);
  if (node.right) markAllVisited(node.right);
}
