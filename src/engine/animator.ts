import type { StateSnapshot, ArrayState, TreeNodeData, GraphState, LinkedListState } from '../types';

export interface AnimationConfig {
  duration: number;
  onFrame: (progress: number, snapshot: StateSnapshot, nextSnapshot: StateSnapshot) => void;
  onComplete?: () => void;
}

export function interpolateNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolateArray(a: number[], b: number[], t: number): number[] {
  const len = Math.max(a.length, b.length);
  const result: number[] = [];
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    result.push(interpolateNumber(av, bv, t));
  }
  return result;
}

export function interpolateArrayState(
  from: ArrayState | undefined,
  to: ArrayState | undefined,
  t: number
): ArrayState | undefined {
  if (!from && !to) return undefined;
  if (!from) return to;
  if (!to) return from;
  return {
    elements: interpolateArray(from.elements, to.elements, t),
    comparing: to.comparing,
    swapping: to.swapping,
    sorted: to.sorted,
    pivot: to.pivot,
  };
}

export function interpolateTreeState(
  from: TreeNodeData | null | undefined,
  to: TreeNodeData | null | undefined,
  t: number
): TreeNodeData | null | undefined {
  if (!to) return from;
  if (!from) return to;
  const interpolated: TreeNodeData = {
    ...to,
    x: from.x != null && to.x != null ? interpolateNumber(from.x, to.x, t) : to.x,
    y: from.y != null && to.y != null ? interpolateNumber(from.y, to.y, t) : to.y,
    highlighted: t > 0.5 ? to.highlighted : from.highlighted,
    visited: t > 0.5 ? to.visited : from.visited,
  };
  if (from.left || to.left) {
    interpolated.left = interpolateTreeState(from.left, to.left, t) ?? undefined;
  }
  if (from.right || to.right) {
    interpolated.right = interpolateTreeState(from.right, to.right, t) ?? undefined;
  }
  return interpolated;
}

export function interpolateGraphState(
  from: GraphState | undefined,
  to: GraphState | undefined,
  t: number
): GraphState | undefined {
  if (!from && !to) return undefined;
  if (!from) return to;
  if (!to) return from;
  return {
    nodes: to.nodes.map((n) => {
      const fromNode = from.nodes.find((fn) => fn.id === n.id);
      return {
        ...n,
        x: fromNode?.x != null && n.x != null ? interpolateNumber(fromNode.x, n.x, t) : n.x,
        y: fromNode?.y != null && n.y != null ? interpolateNumber(fromNode.y, n.y, t) : n.y,
        visited: t > 0.5 ? n.visited : (fromNode?.visited ?? false),
        current: t > 0.5 ? n.current : (fromNode?.current ?? false),
      };
    }),
    edges: to.edges,
    currentNode: to.currentNode,
    visitedNodes: t > 0.5 ? to.visitedNodes : from.visitedNodes,
    pathNodes: t > 0.5 ? to.pathNodes : from.pathNodes,
  };
}

export function interpolateLinkedListState(
  from: LinkedListState | undefined,
  to: LinkedListState | undefined,
  t: number
): LinkedListState | undefined {
  if (!from && !to) return undefined;
  if (!from) return to;
  if (!to) return from;
  return {
    nodes: to.nodes.map((n) => {
      const fromNode = from.nodes.find((fn) => fn.id === n.id);
      return {
        ...n,
        x: fromNode?.x != null && n.x != null ? interpolateNumber(fromNode.x, n.x, t) : n.x,
        y: fromNode?.y != null && n.y != null ? interpolateNumber(fromNode.y, n.y, t) : n.y,
        highlighted: t > 0.5 ? n.highlighted : (fromNode?.highlighted ?? false),
      };
    }),
    head: to.head,
    highlightedNode: to.highlightedNode,
    pointerPosition: to.pointerPosition,
  };
}

export class AnimationController {
  private animations: Array<{
    from: StateSnapshot;
    to: StateSnapshot;
    onFrame: (snapshot: StateSnapshot) => void;
  }> = [];
  private rafId: number | null = null;
  private startTime: number = 0;
  private currentIndex: number = 0;
  private speed: number = 1;
  private duration: number = 500;
  private isPlaying: boolean = false;
  private resolveComplete: (() => void) | null = null;

  queue(from: StateSnapshot, to: StateSnapshot, onFrame: (snapshot: StateSnapshot) => void) {
    this.animations.push({ from, to, onFrame });
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  play(): Promise<void> {
    if (this.isPlaying) return Promise.resolve();
    this.isPlaying = true;
    this.currentIndex = 0;
    return new Promise((resolve) => {
      this.resolveComplete = resolve;
      if (this.animations.length === 0) {
        this.isPlaying = false;
        resolve();
        return;
      }
      this.startTime = performance.now();
      this.tick();
    });
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = performance.now();
    this.tick();
  }

  stop() {
    this.pause();
    this.currentIndex = 0;
    this.animations = [];
    if (this.resolveComplete) {
      this.resolveComplete();
      this.resolveComplete = null;
    }
  }

  jumpTo(index: number) {
    this.pause();
    this.currentIndex = Math.max(0, Math.min(index, this.animations.length - 1));
    const anim = this.animations[this.currentIndex];
    if (anim) {
      anim.onFrame(anim.to);
    }
  }

  private tick = () => {
    if (!this.isPlaying) return;
    const elapsed = (performance.now() - this.startTime) * this.speed;
    const animIndex = Math.min(
      Math.floor(elapsed / this.duration),
      this.animations.length - 1
    );

    if (animIndex >= this.animations.length) {
      this.isPlaying = false;
      if (this.resolveComplete) {
        this.resolveComplete();
        this.resolveComplete = null;
      }
      return;
    }

    while (this.currentIndex <= animIndex && this.currentIndex < this.animations.length) {
      const anim = this.animations[this.currentIndex];
      anim.onFrame(anim.to);
      this.currentIndex++;
    }

    if (this.currentIndex >= this.animations.length) {
      this.isPlaying = false;
      if (this.resolveComplete) {
        this.resolveComplete();
        this.resolveComplete = null;
      }
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}
