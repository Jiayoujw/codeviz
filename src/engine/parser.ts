import * as acorn from 'acorn';
import type { StateSnapshot, VariableState } from '../types';

export function parseCode(code: string) {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: 'script',
      locations: true,
    });
    return { ast, error: null };
  } catch (e) {
    return { ast: null, error: (e as Error).message };
  }
}

export function extractVariables(ast: acorn.Node): string[] {
  const vars: Set<string> = new Set();
  const walk = (node: acorn.Node) => {
    if (node.type === 'VariableDeclarator') {
      const declarator = node as acorn.Node & { id: acorn.Node };
      if (declarator.id.type === 'Identifier') {
        const ident = declarator.id as acorn.Node & { name: string };
        vars.add(ident.name);
      }
    }
    for (const key of Object.keys(node)) {
      const val = (node as unknown as Record<string, unknown>)[key];
      if (val && typeof val === 'object' && 'type' in (val as object)) {
        walk(val as unknown as acorn.Node);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object' && 'type' in item) {
            walk(item as unknown as acorn.Node);
          }
        }
      }
    }
  };
  walk(ast);
  return Array.from(vars);
}

export interface ExecutionContext {
  variables: Map<string, unknown>;
  snapshots: StateSnapshot[];
  currentStep: number;
  currentLine: number;
}

export function createExecutionContext(): ExecutionContext {
  return {
    variables: new Map(),
    snapshots: [],
    currentStep: 0,
    currentLine: 0,
  };
}

export function addSnapshot(
  ctx: ExecutionContext,
  line: number,
  description: string,
  extra?: Partial<StateSnapshot>
): StateSnapshot {
  const variables: VariableState[] = [];
  ctx.variables.forEach((value, name) => {
    const type = Array.isArray(value)
      ? 'array'
      : typeof value === 'number'
        ? 'number'
        : typeof value === 'string'
          ? 'string'
          : typeof value === 'boolean'
            ? 'boolean'
            : 'object';
    variables.push({ name, value, type: type as VariableState['type'] });
  });

  const snapshot: StateSnapshot = {
    step: ctx.currentStep++,
    line,
    variables,
    description,
    ...extra,
  };
  ctx.snapshots.push(snapshot);
  return snapshot;
}
