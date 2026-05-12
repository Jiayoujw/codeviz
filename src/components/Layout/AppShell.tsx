import { useState, useCallback, useEffect } from 'react';
import { CodeEditor } from '../Editor/CodeEditor';
import { ArrayVisualizer } from '../Visualizer/ArrayVisualizer';
import { TreeVisualizer } from '../Visualizer/TreeVisualizer';
import { GraphVisualizer } from '../Visualizer/GraphVisualizer';
import { LinkedListVisualizer } from '../Visualizer/LinkedListVisualizer';
import { GridVisualizer } from '../Visualizer/GridVisualizer';
import { DpVisualizer } from '../Visualizer/DPVisualizer';
import { VariablePanel } from '../Visualizer/VariablePanel';
import { PlaybackControls } from '../ControlPanel/PlaybackControls';
import { TemplateList } from '../Sidebar/TemplateList';
import { FlowCanvas } from '../FlowBuilder/FlowCanvas';
import { NodePalette } from '../FlowBuilder/NodePalette';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useLangStore } from '../../store/langStore';
import { useThemeStore } from '../../store/themeStore';
import { useSoundStore } from '../../store/soundStore';
import { useEditorStore } from '../../store/editorStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { getTranslations } from '../../i18n';
import { copyShareUrl } from '../../engine/shareEngine';

type Tab = 'visualizer' | 'flow' | 'compare';

export function AppShell() {
  const visualizationType = useVisualizerStore((s) => s.visualizationType);
  const [tab, setTab] = useState<Tab>('visualizer');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const lang = useLangStore((s) => s.lang);
  const toggleLang = useLangStore((s) => s.toggle);
  const tr = getTranslations(lang);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggle);

  // Init from shared URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (!encoded) return;
    try {
      const json = JSON.parse(decodeURIComponent(atob(encoded)));
      if (json.code) useEditorStore.getState().setCode(json.code);
      if (json.lang) useLangStore.getState().setLang(json.lang);
      if (json.theme) useThemeStore.getState().setTheme(json.theme);
    } catch { /* ignore */ }
  }, []);

  // Share handler
  const handleShare = useCallback(() => {
    const state = {
      algorithm: '' as const,
      code: useEditorStore.getState().code,
      step: usePlaybackStore.getState().currentStep,
      speed: usePlaybackStore.getState().speed,
      lang: useLangStore.getState().lang,
      theme: useThemeStore.getState().theme,
    };
    copyShareUrl(state);
    // brief toast
    const toast = document.createElement('div');
    toast.textContent = lang === 'zh-CN' ? '链接已复制！' : 'Link copied!';
    toast.className = 'fixed top-4 right-4 px-4 py-2 rounded bg-[var(--color-neon-green)]/20 border border-[var(--color-neon-green)] text-[var(--color-neon-green)] text-xs z-50 animate-pulse';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  }, [lang]);

  const renderVisualizer = (type: string) => {
    switch (type) {
      case 'array': return <ArrayVisualizer />;
      case 'tree': return <TreeVisualizer />;
      case 'graph': return <GraphVisualizer />;
      case 'linkedlist': return <LinkedListVisualizer />;
      case 'grid': return <GridVisualizer />;
      case 'dp': return <DpVisualizer />;
      default: return <ArrayVisualizer />;
    }
  };

  const visTypeForComparison = visualizationType === 'array' ? 'array' : visualizationType;

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      {/* Top bar */}
      <header className="responsive-header h-12 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0 gap-1 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] bg-clip-text text-transparent whitespace-nowrap">
            {tr.app.title}
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] tracking-widest hidden sm:inline">
            {tr.app.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tab switcher */}
          <div className="flex rounded overflow-hidden border border-[var(--color-border)]">
            {(['visualizer', 'compare', 'flow'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs transition-colors whitespace-nowrap ${
                  tab === t ? 'bg-[var(--color-neon-purple)] text-white' : 'hover:bg-[var(--color-surface-3)]'
                }`}
              >
                {t === 'visualizer' ? tr.app.visualizer : t === 'compare' ? (lang === 'zh-CN' ? '对比' : 'Compare') : tr.app.flowBuilder}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className={`px-2 py-1.5 text-[10px] rounded border transition-colors ${soundEnabled ? 'border-[var(--color-neon-green)]/30 text-[var(--color-neon-green)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
            title={soundEnabled ? (lang === 'zh-CN' ? '关闭音效' : 'Mute') : (lang === 'zh-CN' ? '开启音效' : 'Unmute')}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="px-2 py-1.5 text-[10px] rounded border border-[var(--color-border)] hover:border-[var(--color-neon-yellow)] transition-colors"
            title={lang === 'zh-CN' ? '切换主题' : 'Toggle theme'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded border border-[var(--color-neon-purple)]/30 hover:border-[var(--color-neon-purple)] bg-[var(--color-neon-purple)]/10 text-[var(--color-neon-purple)] transition-all"
          >
            {tr.lang}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded border border-[var(--color-neon-cyan)]/30 text-[var(--color-neon-cyan)] hover:border-[var(--color-neon-cyan)] hover:shadow-[0_0_10px_var(--color-neon-cyan)] transition-all"
          >
            {lang === 'zh-CN' ? '分享' : 'Share'}
          </button>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-2 py-1.5 text-[10px] rounded border border-[var(--color-border)] hover:border-[var(--color-neon-cyan)] transition-colors whitespace-nowrap"
          >
            {sidebarOpen ? '◄' : '►'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="responsive-sidebar w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto shrink-0">
            <TemplateList />
          </aside>
        )}

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {tab === 'compare' ? (
            /* Comparison Mode: side-by-side */
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 border-r border-[var(--color-border)] flex flex-col">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)] border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                  {lang === 'zh-CN' ? '左侧 - 算法 A' : 'Left - Algorithm A'}
                </div>
                <div className="flex-1 relative overflow-hidden">{renderVisualizer(visualizationType)}</div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)] border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                  {lang === 'zh-CN' ? '右侧 - 算法 B' : 'Right - Algorithm B'}
                </div>
                <div className="flex-1 relative overflow-hidden">{renderVisualizer(visTypeForComparison)}</div>
              </div>
            </div>
          ) : tab === 'visualizer' ? (
            <>
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative overflow-hidden">
                  {renderVisualizer(visualizationType)}
                </div>
                <div className="responsive-right-panel w-80 xl:w-96 border-l border-[var(--color-border)] flex flex-col shrink-0 bg-[var(--color-surface-1)]">
                  <div className="flex-1 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider border-b border-[var(--color-border)]">
                      {tr.app.codeEditor}
                    </div>
                    <CodeEditor />
                  </div>
                  <div className="h-48 border-t border-[var(--color-border)] overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider border-b border-[var(--color-border)]">
                      {tr.app.variables}
                    </div>
                    <VariablePanel />
                  </div>
                </div>
              </div>
              <PlaybackControls />
            </>
          ) : (
            /* Flow Builder */
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
