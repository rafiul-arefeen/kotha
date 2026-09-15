import { DEFAULT_SYMBOLS } from '@/data/symbols';
import type { SymbolItem, VocabularyState } from '@/types';

import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

export const EMPTY_VOCABULARY: VocabularyState = { overrides: {}, custom: [] };

export async function loadVocabulary(): Promise<VocabularyState> {
  const state = await readJSON<VocabularyState>(STORAGE_KEYS.vocabulary, EMPTY_VOCABULARY);
  return {
    overrides: state?.overrides && typeof state.overrides === 'object' ? state.overrides : {},
    custom: Array.isArray(state?.custom) ? state.custom : [],
  };
}

export function saveVocabulary(state: VocabularyState): Promise<void> {
  return writeJSON(STORAGE_KEYS.vocabulary, state);
}

/** Apply educator edits to the built-in symbols and append custom symbols. */
export function mergeSymbols(state: VocabularyState): SymbolItem[] {
  const builtIn = DEFAULT_SYMBOLS.map((symbol) => {
    const o = state.overrides[symbol.id];
    return o ? { ...symbol, ...o } : symbol;
  });
  return [...builtIn, ...state.custom];
}

/** A built-in symbol whose label was changed can no longer use its lexicon entry. */
export function isRelabelled(symbol: SymbolItem): boolean {
  const original = DEFAULT_SYMBOLS.find((s) => s.id === symbol.id);
  return !!original && original.label !== symbol.label;
}
