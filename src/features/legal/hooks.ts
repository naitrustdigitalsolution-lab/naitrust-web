import { useEffect, useState } from 'react';
import { LEGAL_CHANGE_EVENT } from './access';

export function useLegalRefresh() {
  const [version, setVersion] = useState(0);
  useEffect(() => { const update = () => setVersion(v => v + 1); window.addEventListener(LEGAL_CHANGE_EVENT, update); window.addEventListener('storage', update); window.addEventListener('naitrust:deal-evidence-change', update); return () => { window.removeEventListener(LEGAL_CHANGE_EVENT, update); window.removeEventListener('storage', update); window.removeEventListener('naitrust:deal-evidence-change', update); }; }, []);
  return version;
}
