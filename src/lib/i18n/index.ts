export type { Language, TranslationKeys, Translations } from './types';
import { Language, TranslationKeys } from './types';
import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';
import { es } from './es';

export const translations: Record<Language, TranslationKeys> = { ar, en, fr, es };

export const getDirection = (lang: Language): 'rtl' | 'ltr' => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

export const useTranslation = (lang: Language) => {
  const t = (key: keyof TranslationKeys): string => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  return { t, dir: getDirection(lang) };
};
