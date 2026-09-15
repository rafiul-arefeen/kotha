import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

/** symbolId → number of times selected. Used for the "ঘনঘন" category. */
export type SymbolUsage = Record<string, number>;

export async function loadSymbolUsage(): Promise<SymbolUsage> {
  const usage = await readJSON<SymbolUsage>(STORAGE_KEYS.symbolUsage, {});
  return usage && typeof usage === 'object' ? usage : {};
}

export function saveSymbolUsage(usage: SymbolUsage): Promise<void> {
  return writeJSON(STORAGE_KEYS.symbolUsage, usage);
}

export function topSymbolIds(usage: SymbolUsage, limit = 12): string[] {
  return Object.entries(usage)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
