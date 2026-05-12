import type { StateSnapshot, LinkedListState, LinkedListNodeData } from '../../types';

function createLLSnapshot(
  step: number,
  line: number,
  state: LinkedListState,
  description: string
): StateSnapshot {
  return { step, line, variables: [], description, linkedListState: state };
}

function cloneLLState(s: LinkedListState): LinkedListState {
  return {
    nodes: s.nodes.map((n) => ({ ...n })),
    head: s.head,
    highlightedNode: s.highlightedNode,
    pointerPosition: s.pointerPosition,
  };
}

function makeLLNode(value: number): LinkedListNodeData {
  return { id: `ll-${value}-${Math.random().toString(36).slice(2, 6)}`, value, highlighted: false };
}

function buildList(values: number[]): LinkedListState {
  const nodes = values.map(makeLLNode);
  return {
    nodes,
    head: nodes.length > 0 ? nodes[0].id : null,
    highlightedNode: null,
    pointerPosition: null,
  };
}

export function linkedListInsertHeadSnapshots(values?: number[], insertValue?: number): StateSnapshot[] {
  const vals = values ?? [10, 20, 30, 40];
  const insertVal = insertValue ?? 5;
  const snapshots: StateSnapshot[] = [];
  let state = buildList(vals);
  let step = 0;

  snapshots.push(createLLSnapshot(step++, 1, cloneLLState(state), `Initial linked list: [${vals.join(' → ')}]`));

  const newNode = makeLLNode(insertVal);
  newNode.highlighted = true;

  snapshots.push(
    createLLSnapshot(step++, 3, { ...cloneLLState(state), highlightedNode: newNode.id, pointerPosition: 0 },
      `Creating new node with value ${insertVal}`)
  );

  state.nodes.unshift(newNode);
  state.head = newNode.id;
  state.highlightedNode = newNode.id;

  snapshots.push(
    createLLSnapshot(step++, 5, cloneLLState(state), `Inserted ${insertVal} at head. New list: [${state.nodes.map((n) => n.value).join(' → ')}]`)
  );

  state.highlightedNode = null;
  snapshots.push(createLLSnapshot(step++, 7, cloneLLState(state), 'Insert at head complete!'));

  return snapshots;
}

export function linkedListDeleteSnapshots(values?: number[], deleteValue?: number): StateSnapshot[] {
  const vals = values ?? [10, 20, 30, 40, 50];
  const delVal = deleteValue ?? 30;
  const snapshots: StateSnapshot[] = [];
  let state = buildList(vals);
  let step = 0;

  snapshots.push(createLLSnapshot(step++, 1, cloneLLState(state), `Initial linked list: [${vals.join(' → ')}]`));
  snapshots.push(createLLSnapshot(step++, 3, cloneLLState(state), `Searching for value ${delVal} to delete`));

  const idx = state.nodes.findIndex((n) => n.value === delVal);
  if (idx === -1) {
    snapshots.push(createLLSnapshot(step++, 5, cloneLLState(state), `Value ${delVal} not found in list`));
    return snapshots;
  }

  for (let i = 0; i <= idx; i++) {
    const s = cloneLLState(state);
    s.highlightedNode = state.nodes[i].id;
    s.pointerPosition = i;
    snapshots.push(
      createLLSnapshot(step++, 5, s, i === idx ? `Found node with value ${delVal} at position ${i}` : `Traversing node at position ${i} (value=${state.nodes[i].value})`)
    );
  }

  const targetNode = state.nodes[idx];
  targetNode.highlighted = true;
  state.highlightedNode = targetNode.id;

  snapshots.push(
    createLLSnapshot(step++, 7, cloneLLState(state), `Removing node with value ${delVal}`)
  );

  state.nodes.splice(idx, 1);
  if (idx === 0) {
    state.head = state.nodes.length > 0 ? state.nodes[0].id : null;
  }
  state.highlightedNode = null;
  state.pointerPosition = null;

  const remaining = state.nodes.map((n) => n.value).join(' → ') || 'empty';
  snapshots.push(
    createLLSnapshot(step++, 9, cloneLLState(state), `Deleted ${delVal}. New list: [${remaining}]`)
  );

  return snapshots;
}

export function linkedListReverseSnapshots(values?: number[]): StateSnapshot[] {
  const vals = values ?? [10, 20, 30, 40, 50];
  const snapshots: StateSnapshot[] = [];
  let state = buildList(vals);
  let step = 0;

  snapshots.push(createLLSnapshot(step++, 1, cloneLLState(state), `Initial list: [${vals.join(' → ')}]`));
  snapshots.push(createLLSnapshot(step++, 3, cloneLLState(state), 'Starting reversal using 3-pointer technique'));

  let curr: string | null = state.head;
  const nodeMap = new Map(state.nodes.map((n) => [n.id, n]));
  let pos = 0;

  while (curr) {
    const currNode = nodeMap.get(curr)!;
    const s = cloneLLState(state);
    const cn = s.nodes.find((n) => n.id === curr)!;
    cn.highlighted = true;
    s.highlightedNode = curr;
    s.pointerPosition = pos;

    snapshots.push(
      createLLSnapshot(step++, 5, s, `Processing node ${currNode.value} at position ${pos}`)
    );

    state.nodes[pos].highlighted = true;
    pos++;
    curr = null;
    if (pos < state.nodes.length) {
      curr = state.nodes[pos].id;
    }
  }

  state.nodes.reverse();
  state.head = state.nodes[0]?.id ?? null;
  state.highlightedNode = null;
  state.pointerPosition = null;
  state.nodes.forEach((n) => (n.highlighted = false));

  const reversed = state.nodes.map((n) => n.value).join(' → ');
  snapshots.push(createLLSnapshot(step++, 7, cloneLLState(state), `Reversed list: [${reversed}]`));

  return snapshots;
}
