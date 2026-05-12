import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowNodeData } from '../../types';

export const AlgorithmNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as FlowNodeData;

  const getStyle = (type: string) => {
    switch (type) {
      case 'start': return { border: 'var(--color-neon-green)', glow: 'var(--color-neon-green)' };
      case 'end': return { border: 'var(--color-neon-pink)', glow: 'var(--color-neon-pink)' };
      case 'loop': return { border: 'var(--color-neon-cyan)', glow: 'var(--color-neon-cyan)' };
      case 'operation': return { border: 'var(--color-neon-purple)', glow: 'var(--color-neon-purple)' };
      case 'condition': return { border: 'var(--color-neon-yellow)', glow: 'var(--color-neon-yellow)' };
      default: return { border: 'var(--color-border)', glow: 'var(--color-neon-cyan)' };
    }
  };

  const style = getStyle(nodeData.nodeType);

  return (
    <div
      className={`px-4 py-3 rounded-lg min-w-[160px] transition-all ${
        selected ? 'ring-2 ring-[var(--color-neon-cyan)]' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #12121a, #1a1a26)',
        border: `2px solid ${style.border}`,
        boxShadow: `0 0 12px ${style.glow}33`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.border }} />
      <div className="text-xs font-semibold text-center" style={{ color: style.border }}>
        {nodeData.label}
      </div>
      <div className="text-[10px] text-center text-[var(--color-text-secondary)] mt-1">
        {nodeData.nodeType}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: style.border }} />
    </div>
  );
});

AlgorithmNode.displayName = 'AlgorithmNode';
