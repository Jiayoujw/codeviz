import { create } from 'zustand';
import type { EditorState } from '../types';

interface EditorActions {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setCurrentLine: (line: number) => void;
  initCode: (lang: string) => void;
}

const defaultCode = {
  'zh-CN': '// 从侧边栏选择算法或自行编写！\nconst arr = [64, 34, 25, 12, 22, 11, 90];\nbubbleSort(arr);',
  'en-US': '// Select an algorithm from the sidebar or write your own!\nconst arr = [64, 34, 25, 12, 22, 11, 90];\nbubbleSort(arr);',
};

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  code: defaultCode['zh-CN'],
  language: 'javascript',
  currentLine: -1,
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setCurrentLine: (line) => set({ currentLine: line }),
  initCode: (lang: string) => set({ code: defaultCode[lang as keyof typeof defaultCode] ?? defaultCode['zh-CN'] }),
}));
