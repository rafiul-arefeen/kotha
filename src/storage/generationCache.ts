import type { GenerationRequest, GenerationResult } from '@/types';

import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from './storage';

/**
 * Cache of generated sentences, so a phrase generated once online is still
 * available offline. Small LRU kept in AsyncStorage.
 */
const MAX_ENTRIES = 150;

interface CacheFile {
  entries: { key: string; result: GenerationResult; at: number }[];
}

let memory: CacheFile | null = null;

async function load(): Promise<CacheFile> {
  if (!memory) {
    const file = await readJSON<CacheFile>(STORAGE_KEYS.generationCache, { entries: [] });
    memory = Array.isArray(file?.entries) ? file : { entries: [] };
  }
  return memory;
}

export function cacheKey(request: GenerationRequest): string {
  const items = request.items.map((i) => (i.symbolId && !i.custom ? `s:${i.symbolId}` : `k:${i.text.normalize('NFC')}`));
  return [request.register, request.style, request.variant, ...items].join('|');
}

export async function getCachedGeneration(request: GenerationRequest): Promise<GenerationResult | null> {
  const file = await load();
  const key = cacheKey(request);
  return file.entries.find((e) => e.key === key)?.result ?? null;
}

export async function putCachedGeneration(request: GenerationRequest, result: GenerationResult): Promise<void> {
  const file = await load();
  const key = cacheKey(request);
  const entries = [{ key, result, at: Date.now() }, ...file.entries.filter((e) => e.key !== key)].slice(0, MAX_ENTRIES);
  memory = { entries };
  await writeJSON(STORAGE_KEYS.generationCache, memory);
}

export async function clearGenerationCache(): Promise<void> {
  memory = { entries: [] };
  await removeKey(STORAGE_KEYS.generationCache);
}

export async function generationCacheSize(): Promise<number> {
  return (await load()).entries.length;
}
