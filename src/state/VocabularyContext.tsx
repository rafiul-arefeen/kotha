import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { DEFAULT_SYMBOLS } from '@/data/symbols';
import { loadSymbolUsage, saveSymbolUsage, topSymbolIds, type SymbolUsage } from '@/storage/symbolUsage';
import { EMPTY_VOCABULARY, loadVocabulary, mergeSymbols, saveVocabulary } from '@/storage/vocabulary';
import type { CategoryId, SymbolItem, SymbolOverride, VocabularyState } from '@/types';
import { makeId } from '@/utils/id';

export interface NewSymbolInput {
  label: string;
  en: string;
  icon: string;
  category: CategoryId;
  keywords?: string[];
}

interface VocabularyValue {
  ready: boolean;
  /** All symbols (built-in with edits applied, then custom). */
  symbols: SymbolItem[];
  symbolById: Record<string, SymbolItem>;
  usage: SymbolUsage;
  frequentIds: string[];
  recordUsage: (symbolId: string) => void;
  clearUsage: () => void;
  updateSymbol: (id: string, patch: SymbolOverride) => void;
  addSymbol: (input: NewSymbolInput) => void;
  deleteCustomSymbol: (id: string) => void;
  resetSymbol: (id: string) => void;
  resetVocabulary: () => void;
  isEdited: (id: string) => boolean;
}

const VocabularyContext = createContext<VocabularyValue | null>(null);

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VocabularyState>(EMPTY_VOCABULARY);
  const [usage, setUsage] = useState<SymbolUsage>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([loadVocabulary(), loadSymbolUsage()]).then(([vocabulary, storedUsage]) => {
      if (!alive) return;
      setState(vocabulary);
      setUsage(storedUsage);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void saveVocabulary(state);
  }, [state, ready]);

  useEffect(() => {
    if (ready) void saveSymbolUsage(usage);
  }, [usage, ready]);

  const symbols = mergeSymbols(state);
  const symbolById = Object.fromEntries(symbols.map((s) => [s.id, s]));

  const updateSymbol = (id: string, patch: SymbolOverride) =>
    setState((prev) => {
      if (prev.custom.some((s) => s.id === id)) {
        return { ...prev, custom: prev.custom.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
      }
      return { ...prev, overrides: { ...prev.overrides, [id]: { ...prev.overrides[id], ...patch } } };
    });

  const addSymbol = (input: NewSymbolInput) =>
    setState((prev) => ({
      ...prev,
      custom: [
        ...prev.custom,
        {
          id: makeId('sym'),
          label: input.label.trim(),
          en: input.en.trim(),
          icon: input.icon.trim() || '⭐',
          category: input.category,
          keywords: input.keywords,
          enabled: true,
          custom: true,
        },
      ],
    }));

  const deleteCustomSymbol = (id: string) =>
    setState((prev) => ({ ...prev, custom: prev.custom.filter((s) => s.id !== id) }));

  const resetSymbol = (id: string) =>
    setState((prev) => {
      const overrides = { ...prev.overrides };
      delete overrides[id];
      return { ...prev, overrides };
    });

  const isEdited = (id: string) => {
    const o = state.overrides[id];
    if (!o) return false;
    const original = DEFAULT_SYMBOLS.find((s) => s.id === id);
    if (!original) return false;
    return (
      (o.label !== undefined && o.label !== original.label) ||
      (o.en !== undefined && o.en !== original.en) ||
      (o.icon !== undefined && o.icon !== original.icon) ||
      (o.keywords !== undefined && (o.keywords ?? []).join(',') !== (original.keywords ?? []).join(','))
    );
  };

  return (
    <VocabularyContext
      value={{
        ready,
        symbols,
        symbolById,
        usage,
        frequentIds: topSymbolIds(usage).filter((id) => symbolById[id]?.enabled),
        recordUsage: (symbolId) => setUsage((prev) => ({ ...prev, [symbolId]: (prev[symbolId] ?? 0) + 1 })),
        clearUsage: () => setUsage({}),
        updateSymbol,
        addSymbol,
        deleteCustomSymbol,
        resetSymbol,
        resetVocabulary: () => setState(EMPTY_VOCABULARY),
        isEdited,
      }}>
      {children}
    </VocabularyContext>
  );
}

export function useVocabulary(): VocabularyValue {
  const ctx = useContext(VocabularyContext);
  if (!ctx) throw new Error('useVocabulary must be used inside VocabularyProvider');
  return ctx;
}
