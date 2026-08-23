import { Languages } from 'lucide-react';
import { useAppLocale } from '../../libs/locale-context';

export function AppLanguageToggle({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  const { locale, setLocale } = useAppLocale();
  return <div className={`flex items-center gap-1 rounded-full border p-1 ${inverse ? 'border-white/20 bg-white/10' : 'bg-background'}`} aria-label={locale === 'en' ? 'Language' : '语言'}>
    {!compact && <Languages size={14} className={inverse ? 'ml-2 text-white/70' : 'ml-2 text-muted-foreground'} />}
    <button type="button" onClick={() => setLocale('en')} aria-pressed={locale === 'en'} className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${locale === 'en' ? 'bg-primary text-primary-foreground' : inverse ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>EN</button>
    <button type="button" title="简体中文" onClick={() => setLocale('zh-CN')} aria-pressed={locale === 'zh-CN'} className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${locale === 'zh-CN' ? 'bg-primary text-primary-foreground' : inverse ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>中文</button>
  </div>;
}
