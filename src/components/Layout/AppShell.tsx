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
import { WelcomeHero } from './WelcomeHero';
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
  const snapshots = useVisualizerStore((s) => s.snapshots);
  const playbackStatus = usePlaybackStore((s) => s.status);
  const [tab, setTab] = useState<Tab>('visualizer');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <header className="responsive-header h-12 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0 gap-2 flex-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          {/* Hamburger for mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="hidden max-[768px]:flex w-8 h-8 items-center justify-center rounded border border-[var(--color-border)] hover:border-[var(--color-neon-cyan)] transition-colors shrink-0"
            title="Menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] bg-clip-text text-transparent whitespace-nowrap">
            {tr.app.title}
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] tracking-wide hidden sm:inline">
            {tr.app.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Nav group: tab switcher */}
          <div className="flex rounded-md overflow-hidden border border-[var(--color-border)] mr-1">
            {(['visualizer', 'compare', 'flow'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  tab === t ? 'bg-[var(--color-neon-purple)] text-white' : 'hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                }`}
              >
                {t === 'visualizer' ? tr.app.visualizer : t === 'compare' ? (lang === 'zh-CN' ? '对比' : 'Compare') : tr.app.flowBuilder}
              </button>
            ))}
          </div>

          {/* Tool group */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="w-8 h-8 flex items-center justify-center rounded border text-xs transition-colors"
              style={{ borderColor: soundEnabled ? 'var(--color-neon-green)' : 'var(--color-border)', color: soundEnabled ? 'var(--color-neon-green)' : 'var(--color-text-secondary)' }}
              title={soundEnabled ? (lang === 'zh-CN' ? '关闭音效' : 'Mute') : (lang === 'zh-CN' ? '开启音效' : 'Unmute')}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded border border-[var(--color-border)] text-xs hover:border-[var(--color-neon-yellow)] transition-colors"
              title={lang === 'zh-CN' ? '切换主题' : 'Toggle theme'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={toggleLang}
              className="px-2 py-1 text-[11px] rounded border border-[var(--color-neon-purple)]/40 text-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/10 transition-all"
            >
              {tr.lang}
            </button>
            <button
              onClick={handleShare}
              className="px-2 py-1 text-[11px] rounded border border-[var(--color-neon-cyan)]/40 text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/10 transition-all"
            >
              {lang === 'zh-CN' ? '分享' : 'Share'}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded border border-[var(--color-border)] hover:border-[var(--color-neon-cyan)] transition-colors text-xs"
              title={sidebarOpen ? (lang === 'zh-CN' ? '收起侧栏' : 'Collapse sidebar') : (lang === 'zh-CN' ? '展开侧栏' : 'Expand sidebar')}
            >
              {sidebarOpen ? '◄' : '►'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - desktop */}
        {sidebarOpen && (
          <aside className="hidden md:block w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto shrink-0">
            <TemplateList />
          </aside>
        )}

        {/* Sidebar - mobile overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-0 bottom-0 w-[85%] max-w-xs border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto z-50 shadow-2xl md:hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {lang === 'zh-CN' ? '算法模板' : 'Templates'}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  ✕
                </button>
              </div>
              <TemplateList />
            </aside>
          </>
        )}

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {tab === 'compare' ? (
            /* Comparison Mode: side-by-side */
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 border-r border-[var(--color-border)] flex flex-col">
                <div className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                  {lang === 'zh-CN' ? '左侧 - 算法 A' : 'Left - Algorithm A'}
                </div>
                <div className="flex-1 relative overflow-hidden">{renderVisualizer(visualizationType)}</div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                  {lang === 'zh-CN' ? '右侧 - 算法 B' : 'Right - Algorithm B'}
                </div>
                <div className="flex-1 relative overflow-hidden">{renderVisualizer(visTypeForComparison)}</div>
              </div>
            </div>
          ) : tab === 'visualizer' ? (
            <>
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative overflow-hidden">
                  {playbackStatus === 'idle' && snapshots.length === 0
                    ? <WelcomeHero />
                    : renderVisualizer(visualizationType)
                  }
                </div>
                <div className="responsive-right-panel w-80 xl:w-96 border-l border-[var(--color-border)] flex flex-col shrink-0 bg-[var(--color-surface-1)]">
                  <div className="flex-1 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide border-b border-[var(--color-border)]">
                      {tr.app.codeEditor}
                    </div>
                    <CodeEditor />
                  </div>
                  <div className="h-48 border-t border-[var(--color-border)] overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide border-b border-[var(--color-border)]">
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
