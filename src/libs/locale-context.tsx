import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import i18n from '../i18n';

export type AppLocale = 'en' | 'zh-CN';

const STORAGE_KEY = 'naitrust:locale';

function initialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'zh-CN') return saved;
  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

const LocaleContext = createContext<{ locale: AppLocale; setLocale: (locale: AppLocale) => void } | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => i18n.resolvedLanguage === 'zh-CN' ? 'zh-CN' : initialLocale());
  const setLocale = (next: AppLocale) => { setLocaleState(next); void i18n.changeLanguage(next); };
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
    if (i18n.resolvedLanguage !== locale) void i18n.changeLanguage(locale);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useAppLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useAppLocale must be used inside LocaleProvider.');
  return context;
}
