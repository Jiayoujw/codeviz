import { NEON_CYAN, NEON_GREEN, NEON_PINK, NEON_PURPLE, NEON_YELLOW } from '../../utils/color';

const blocks = [
  { type: 'start', label: 'Start', color: NEON_GREEN, description: 'Algorithm entry point' },
  { type: 'loop', label: 'Loop', color: NEON_CYAN, description: 'For / While loop' },
  { type: 'condition', label: 'Condition', color: NEON_YELLOW, description: 'If / Else branch' },
  { type: 'operation', label: 'Operation', color: NEON_PURPLE, description: 'Array/tree/graph operation' },
  { type: 'variable', label: 'Variable', color: NEON_CYAN, description: 'Declare or assign variable' },
  { type: 'end', label: 'End', color: NEON_PINK, description: 'Algorithm end / return' },
];

export function NodePalette() {
  const onDragStart = (e: React.DragEvent, block: typeof blocks[0]) => {
    e.dataTransfer.setData('application/reactflow-type', block.type);
    e.dataTransfer.setData('application/reactflow-label', block.label);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-3">
      <div className="text-xs font-bold text-[var(--color-text-primary)] tracking-wider mb-4">
        BLOCKS
      </div>
      <div className="space-y-2">
        {blocks.map((block) => (
          <div
            key={block.type}
            draggable
            onDragStart={(e) => onDragStart(e, block)}
            className="px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform border"
            style={{
              background: 'linear-gradient(135deg, #12121a, #1a1a26)',
              borderColor: block.color + '44',
              boxShadow: `0 0 8px ${block.color}22`,
            }}
          >
            <div className="text-xs font-semibold" style={{ color: block.color }}>
              {block.label}
            </div>
            <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
              {block.description}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <div className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
          Drag blocks to the canvas and connect them to build your algorithm flow.
        </div>
      </div>
    </div>
  );
}
