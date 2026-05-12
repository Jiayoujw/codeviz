import { NEON_CYAN, NEON_GREEN, NEON_PINK, NEON_PURPLE, NEON_YELLOW } from '../../utils/color';
import { useLangStore } from '../../store/langStore';
import { getTranslations } from '../../i18n';

export function NodePalette() {
  const lang = useLangStore((s) => s.lang);
  const tr = getTranslations(lang);

  const blocks = [
    { type: 'start', label: tr.flow.start, color: NEON_GREEN, description: tr.flow.startDesc },
    { type: 'loop', label: tr.flow.loop, color: NEON_CYAN, description: tr.flow.loopDesc },
    { type: 'condition', label: tr.flow.condition, color: NEON_YELLOW, description: tr.flow.conditionDesc },
    { type: 'operation', label: tr.flow.operation, color: NEON_PURPLE, description: tr.flow.operationDesc },
    { type: 'variable', label: tr.flow.variable, color: NEON_CYAN, description: tr.flow.variableDesc },
    { type: 'end', label: tr.flow.end, color: NEON_PINK, description: tr.flow.endDesc },
  ];

  const onDragStart = (e: React.DragEvent, block: typeof blocks[0]) => {
    e.dataTransfer.setData('application/reactflow-type', block.type);
    e.dataTransfer.setData('application/reactflow-label', block.label);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-3">
      <div className="text-xs font-bold text-[var(--color-text-primary)] tracking-wider mb-4">
        {tr.flow.blocks}
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
          {tr.flow.hint}
        </div>
      </div>
    </div>
  );
}
