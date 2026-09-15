import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { loadHistory, recordMessage, saveHistory, type NewMessage } from '@/storage/history';
import type { HistoryEntry } from '@/types';

interface HistoryValue {
  ready: boolean;
  entries: HistoryEntry[];
  record: (message: NewMessage) => void;
  toggleFavorite: (id: string) => void;
  isFavoriteText: (text: string) => boolean;
  remove: (id: string) => void;
  /** Clears history; favourites are kept unless `includeFavorites` is true. */
  clear: (includeFavorites?: boolean) => void;
}

const HistoryContext = createContext<HistoryValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadHistory().then((stored) => {
      if (!alive) return;
      setEntries(stored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void saveHistory(entries);
  }, [entries, ready]);

  return (
    <HistoryContext
      value={{
        ready,
        entries,
        record: (message) => setEntries((prev) => recordMessage(prev, message)),
        toggleFavorite: (id) =>
          setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e))),
        isFavoriteText: (text) => entries.some((e) => e.favorite && e.text === text.trim()),
        remove: (id) => setEntries((prev) => prev.filter((e) => e.id !== id)),
        clear: (includeFavorites = false) =>
          setEntries((prev) => (includeFavorites ? [] : prev.filter((e) => e.favorite))),
      }}>
      {children}
    </HistoryContext>
  );
}

export function useHistory(): HistoryValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
}
