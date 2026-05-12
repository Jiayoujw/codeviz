import { useMemo } from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';

export function CodeEditor() {
  const code = useEditorStore((s) => s.code);
  const setCode = useEditorStore((s) => s.setCode);
  const theme = useThemeStore((s) => s.theme);

  const cmTheme = useMemo(() => theme === 'light' ? undefined : oneDark, [theme]);

  return (
    <div className="h-full overflow-auto">
      <ReactCodeMirror
        value={code}
        onChange={(val) => setCode(val)}
        extensions={[javascript({ jsx: false })]}
        theme={cmTheme}
        height="100%"
        style={{ height: '100%', fontSize: '13px' }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          foldGutter: true,
          autocompletion: true,
        }}
      />
    </div>
  );
}
