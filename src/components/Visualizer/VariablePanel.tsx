import { useVisualizerStore } from '../../store/visualizerStore';

export function VariablePanel() {
  const currentSnapshot = useVisualizerStore((s) => s.currentSnapshot);

  const vars = currentSnapshot?.variables ?? [];

  return (
    <div className="h-full overflow-auto p-3">
      {vars.length === 0 ? (
        <div className="text-xs text-[var(--color-text-secondary)] text-center mt-4">
          No variables to display
        </div>
      ) : (
        <div className="space-y-1">
          {vars.map((v, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2 py-1.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            >
              <span className="text-xs text-[var(--color-neon-cyan)] font-mono">{v.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{v.type}</span>
              <span className="text-xs text-[var(--color-text-primary)] ml-auto font-mono truncate max-w-[150px]">
                {formatValue(v.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.slice(0, 10).join(', ')}${value.length > 10 ? ', ...' : ''}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value).slice(0, 50);
  }
  return String(value);
}
