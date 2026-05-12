import { create } from 'zustand';
import type { Lang } from '../i18n';

interface LangState {
  lang: Lang;
  toggle: () => void;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: (localStorage.getItem('codeviz-lang') as Lang) || 'zh-CN',
  toggle: () =>
    set((s) => {
      const next = s.lang === 'zh-CN' ? 'en-US' : 'zh-CN';
      localStorage.setItem('codeviz-lang', next);
      return { lang: next };
    }),
  setLang: (lang) => {
    localStorage.setItem('codeviz-lang', lang);
    set({ lang });
  },
}));
