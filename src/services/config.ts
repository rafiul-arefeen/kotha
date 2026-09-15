/**
 * Runtime configuration from EXPO_PUBLIC_* environment variables.
 *
 * Expo inlines these at build time, so they must be read with static
 * `process.env.EXPO_PUBLIC_…` expressions (no destructuring).
 *
 * EXPO_PUBLIC_* values end up inside the app bundle. Never put provider API
 * keys here — the app talks to the Kotha API, which holds the secrets.
 * See docs/API_INTEGRATION.md.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type LLMMode = 'mock' | 'remote';
export type TTSMode = 'device' | 'mock' | 'remote';

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  const v = value?.trim().toLowerCase();
  return (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback;
}

/**
 * In development, the Expo dev server on the laptop also serves the Kotha API
 * (Expo Router API routes in src/app/api). A phone running Expo Go reaches it
 * at the same host it loaded the JavaScript from, e.g.
 * http://192.168.0.12:8081/api.
 */
function devServerApiUrl(): string {
  if (!__DEV__) return '';
  if (Platform.OS === 'web') return '/api';
  const hostUri = Constants.expoConfig?.hostUri?.replace(/\/+$/, '');
  if (!hostUri) return '';
  const host = hostUri.split(':')[0];
  const localNetwork =
    host === 'localhost' || /^(127|10)\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  // `expo start --tunnel` gives an https *.exp.direct host.
  return `${localNetwork ? 'http' : 'https'}://${hostUri}/api`;
}

const explicitApiUrl = (process.env.EXPO_PUBLIC_KOTHA_API_URL ?? '').trim().replace(/\/+$/, '');

export const config = {
  /**
   * Base URL of the Kotha API (no trailing slash). EXPO_PUBLIC_KOTHA_API_URL
   * wins; otherwise, in development, the laptop's Expo dev server is used.
   */
  apiUrl: explicitApiUrl || devServerApiUrl(),
  apiUrlSource: explicitApiUrl ? ('env' as const) : ('dev-server' as const),
  llmMode: pick<LLMMode>(process.env.EXPO_PUBLIC_LLM_MODE, ['mock', 'remote'], 'mock'),
  ttsMode: pick<TTSMode>(process.env.EXPO_PUBLIC_TTS_MODE, ['device', 'mock', 'remote'], 'device'),
  requestTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 15000,
} as const;
