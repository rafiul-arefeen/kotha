import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * All persisted data stays on the device. Nothing here is sent anywhere.
 * Keys are versioned so the schema can change without crashing old installs.
 */
export const STORAGE_KEYS = {
  preferences: 'kotha:v1:preferences',
  history: 'kotha:v1:history',
  symbolUsage: 'kotha:v1:symbol-usage',
  generationCache: 'kotha:v1:generation-cache',
  vocabulary: 'kotha:v1:vocabulary',
} as const;

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`[storage] could not read ${key}`, error);
    return fallback;
  }
}

export async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] could not write ${key}`, error);
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] could not remove ${key}`, error);
  }
}
