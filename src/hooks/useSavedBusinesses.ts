import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../libs/auth-context';

const PREFIX = 'naitrust:saved-businesses:v1:';

export function useSavedBusinesses() {
  const { user } = useAuth();
  const key = `${PREFIX}${user?.id ?? 'anonymous'}`;
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try { setIds(JSON.parse(window.localStorage.getItem(key) ?? '[]')); } catch { setIds([]); }
  }, [key]);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [id, ...current];
      window.localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return { savedBusinessIds: ids, toggleSavedBusiness: toggle };
}
