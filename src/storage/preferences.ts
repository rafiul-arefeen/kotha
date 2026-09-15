import { REGISTER_BY_ID } from '@/data/registers';
import type { DwellMs, GridSize, Preferences, TextScale } from '@/types';

import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

export const DEFAULT_PREFERENCES: Preferences = {
  onboarded: false,
  register: null,
  dwellMs: 0,
  ttsEnabled: true,
  speechRate: 1,
  textScale: 1,
  gridSize: 'medium',
  highContrast: false,
  showEnglish: true,
};

export const DWELL_OPTIONS: DwellMs[] = [0, 1000, 1500, 2000];
export const TEXT_SCALES: TextScale[] = [1, 1.15, 1.3];
export const GRID_SIZES: GridSize[] = ['large', 'medium', 'small'];
export const SPEECH_RATES = [0.7, 0.85, 1, 1.15, 1.3];

/** Merge stored values with defaults, dropping anything invalid. */
function sanitize(stored: Partial<Preferences>): Preferences {
  const p = { ...DEFAULT_PREFERENCES };
  if (typeof stored.onboarded === 'boolean') p.onboarded = stored.onboarded;
  if (stored.register && REGISTER_BY_ID[stored.register]) p.register = stored.register;
  if (DWELL_OPTIONS.includes(stored.dwellMs as DwellMs)) p.dwellMs = stored.dwellMs as DwellMs;
  if (typeof stored.ttsEnabled === 'boolean') p.ttsEnabled = stored.ttsEnabled;
  if (typeof stored.speechRate === 'number' && stored.speechRate >= 0.5 && stored.speechRate <= 2) {
    p.speechRate = stored.speechRate;
  }
  if (TEXT_SCALES.includes(stored.textScale as TextScale)) p.textScale = stored.textScale as TextScale;
  if (GRID_SIZES.includes(stored.gridSize as GridSize)) p.gridSize = stored.gridSize as GridSize;
  if (typeof stored.highContrast === 'boolean') p.highContrast = stored.highContrast;
  if (typeof stored.showEnglish === 'boolean') p.showEnglish = stored.showEnglish;
  return p;
}

export async function loadPreferences(): Promise<Preferences> {
  return sanitize(await readJSON<Partial<Preferences>>(STORAGE_KEYS.preferences, {}));
}

export function savePreferences(preferences: Preferences): Promise<void> {
  return writeJSON(STORAGE_KEYS.preferences, preferences);
}
