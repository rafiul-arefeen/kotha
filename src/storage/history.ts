import type { HistoryEntry, MessageOrigin, RegisterId } from '@/types';
import { makeId } from '@/utils/id';

import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

const MAX_ENTRIES = 300;

export async function loadHistory(): Promise<HistoryEntry[]> {
  const entries = await readJSON<HistoryEntry[]>(STORAGE_KEYS.history, []);
  return Array.isArray(entries) ? entries.filter((e) => typeof e?.text === 'string') : [];
}

export function saveHistory(entries: HistoryEntry[]): Promise<void> {
  return writeJSON(STORAGE_KEYS.history, entries);
}

export interface NewMessage {
  text: string;
  register: RegisterId | null;
  origin: MessageOrigin;
  inputs: string[];
}

/**
 * Add a spoken/displayed message, or bump the existing entry if the same text
 * was already used with the same register. Returns a new array (newest first).
 */
export function recordMessage(entries: HistoryEntry[], message: NewMessage, now = Date.now()): HistoryEntry[] {
  const text = message.text.trim();
  if (!text) return entries;
  const index = entries.findIndex((e) => e.text === text && e.register === message.register);
  if (index >= 0) {
    const existing = entries[index];
    const updated: HistoryEntry = {
      ...existing,
      lastUsedAt: now,
      useCount: existing.useCount + 1,
      origin: message.origin === 'history' ? existing.origin : message.origin,
      inputs: message.inputs.length ? message.inputs : existing.inputs,
    };
    return [updated, ...entries.slice(0, index), ...entries.slice(index + 1)];
  }
  const entry: HistoryEntry = {
    id: makeId('msg'),
    text,
    register: message.register,
    origin: message.origin,
    inputs: message.inputs,
    createdAt: now,
    lastUsedAt: now,
    useCount: 1,
    favorite: false,
  };
  const next = [entry, ...entries];
  if (next.length <= MAX_ENTRIES) return next;
  // Drop the oldest non-favourite entries first.
  const favorites = next.filter((e) => e.favorite);
  const others = next.filter((e) => !e.favorite).slice(0, Math.max(0, MAX_ENTRIES - favorites.length));
  return next.filter((e) => e.favorite || others.includes(e));
}
