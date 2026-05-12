import zh from './zh-CN';
import en from './en-US';

export type Lang = 'zh-CN' | 'en-US';
export type Translations = typeof zh;

const translations: Record<Lang, Translations> = {
  'zh-CN': zh,
  'en-US': en,
};

export function t(lang: Lang, key: string): string {
  const keys = key.split('.');
  let result: unknown = translations[lang] ?? translations['zh-CN'];
  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof result === 'string' ? result : key;
}

export function getTranslations(lang: Lang): Translations {
  return translations[lang] ?? translations['zh-CN'];
}
