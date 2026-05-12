import { useState } from 'react';
import { CodeEditor } from '../Editor/CodeEditor';
import { ArrayVisualizer } from '../Visualizer/ArrayVisualizer';
import { TreeVisualizer } from '../Visualizer/TreeVisualizer';
import { GraphVisualizer } from '../Visualizer/GraphVisualizer';
import { LinkedListVisualizer } from '../Visualizer/LinkedListVisualizer';
import { VariablePanel } from '../Visualizer/VariablePanel';
import { PlaybackControls } from '../ControlPanel/PlaybackControls';
import { TemplateList } from '../Sidebar/TemplateList';
import { FlowCanvas } from '../FlowBuilder/FlowCanvas';
import { NodePalette } from '../FlowBuilder/NodePalette';
import { useVisualizerStore } from '../../store/visualizerStore';

type Tab = 'visualizer' | 'flow';

export function AppShell() {
  const visualizationType = useVisualizerStore((s) => s.visualizationType);
  const [tab, setTab] = useState<Tab>('visualizer');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderVisualizer = () => {
    switch (visualizationType) {
      case 'array': return <ArrayVisualizer />;
      case 'tree': return <TreeVisualizer />;
      case 'graph': return <GraphVisualizer />;
      case 'linkedlist': return <LinkedListVisualizer />;
      default: return <ArrayVisualizer />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      {/* Top bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] bg-clip-text text-transparent">
            CodeViz
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] tracking-widest">EDUCATION PLATFORM</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] hover:border-[var(--color-neon-cyan)] transition-colors"
          >
            {sidebarOpen ? '◄ Templates' : '► Templates'}
          </button>
          <div className="flex rounded overflow-hidden border border-[var(--color-border)]">
            <button
              onClick={() => setTab('visualizer')}
              className={`px-4 py-1.5 text-xs transition-colors ${tab === 'visualizer' ? 'bg-[var(--color-neon-purple)] text-white' : 'hover:bg-[var(--color-surface-3)]'}`}
            >
              Visualizer
            </button>
            <button
              onClick={() => setTab('flow')}
              className={`px-4 py-1.5 text-xs transition-colors ${tab === 'flow' ? 'bg-[var(--color-neon-purple)] text-white' : 'hover:bg-[var(--color-surface-3)]'}`}
            >
              Flow Builder
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto shrink-0">
            <TemplateList />
          </aside>
        )}

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {tab === 'visualizer' ? (
            <>
              <div className="flex-1 flex overflow-hidden">
                {/* Visualization panel */}
                <div className="flex-1 relative overflow-hidden">
                  {renderVisualizer()}
                </div>

                {/* Right panel: Editor + Variables */}
                <div className="w-96 border-l border-[var(--color-border)] flex flex-col shrink-0 bg-[var(--color-surface-1)]">
                  <div className="flex-1 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider border-b border-[var(--color-border)]">
                      CODE EDITOR
                    </div>
                    <CodeEditor />
                  </div>
                  <div className="h-48 border-t border-[var(--color-border)] overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider border-b border-[var(--color-border)]">
                      VARIABLES
                    </div>
                    <VariablePanel />
                  </div>
                </div>
              </div>
              <PlaybackControls />
            </>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-48 border-r border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0">
                <NodePalette />
              </div>
              <div className="flex-1">
                <FlowCanvas />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
