import { createContext, useContext } from 'react';

export const WorkspaceContext = createContext({ session: null, settings: { firmName: '' }, setSettings: () => {}, health: null });
export const useWorkspace = () => useContext(WorkspaceContext);

export const MODE_LABEL = { sea: 'Sea', air: 'Air', road: 'Road' };

export function fmtDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function fmtDate(d) {
  if (!d) return '';
  return new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
