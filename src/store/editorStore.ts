import { create } from 'zustand';
import type { EditorState } from '../types';

interface EditorActions {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setCurrentLine: (line: number) => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  code: `// Select an algorithm from the sidebar or write your own!\nconst arr = [64, 34, 25, 12, 22, 11, 90];\nbubbleSort(arr);`,
  language: 'javascript',
  currentLine: -1,
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setCurrentLine: (line) => set({ currentLine: line }),
}));
