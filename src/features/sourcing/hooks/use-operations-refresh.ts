import { useEffect, useState } from 'react';
import { OPERATIONS_CHANGED_EVENT } from '../data/operations-repository';

export function useOperationsRefresh(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion((current) => current + 1);
    window.addEventListener(OPERATIONS_CHANGED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(OPERATIONS_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return version;
}
