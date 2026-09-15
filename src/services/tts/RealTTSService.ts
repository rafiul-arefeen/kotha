import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { BANGLA_LANGUAGE, TTSError, type SpeakOptions, type TTSService, type TTSStatus } from './TTSService';

type Subscription = { remove: () => void };

/**
 * Cloud Bangla TTS through the Kotha backend: POST {apiUrl}/v1/tts.
 * The backend returns either `audioUrl` or `audioBase64` (+ `mimeType`),
 * which is played with expo-audio. See docs/API_INTEGRATION.md.
 */
export class RealTTSService implements TTSService {
  readonly kind = 'remote' as const;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private player: AudioPlayer | null = null;
  private subscription: Subscription | null = null;
  private pendingDone: (() => void) | undefined;
  private abort: AbortController | null = null;

  constructor(baseUrl: string, timeoutMs = 15000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  async getStatus(): Promise<TTSStatus> {
    return { kind: 'remote', banglaVoice: this.baseUrl ? 'unknown' : 'missing' };
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    await this.stop();
    if (!this.baseUrl) {
      options.onError?.(new TTSError('not_configured', 'EXPO_PUBLIC_KOTHA_API_URL is not set'));
      return;
    }

    const controller = new AbortController();
    this.abort = controller;
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ text, language: BANGLA_LANGUAGE, rate: options.rate ?? 1 }),
        signal: controller.signal,
      });
      if (!response.ok) throw new TTSError('network', `Backend returned HTTP ${response.status}`);
      const data = (await response.json()) as { audioUrl?: unknown; audioBase64?: unknown; mimeType?: unknown };
      const uri =
        typeof data.audioUrl === 'string'
          ? data.audioUrl
          : typeof data.audioBase64 === 'string'
            ? `data:${typeof data.mimeType === 'string' ? data.mimeType : 'audio/mpeg'};base64,${data.audioBase64}`
            : null;
      if (!uri) throw new TTSError('bad_response', 'Response has neither audioUrl nor audioBase64');
      if (controller.signal.aborted) return;

      const player = createAudioPlayer({ uri });
      this.player = player;
      this.pendingDone = options.onDone;
      this.subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) this.finish();
      });
      player.play();
      options.onStart?.();
    } catch (error) {
      if (controller.signal.aborted && !(error instanceof TTSError)) return;
      options.onError?.(error instanceof TTSError ? error : new TTSError('network', String(error)));
    } finally {
      clearTimeout(timer);
      if (this.abort === controller) this.abort = null;
    }
  }

  private finish() {
    const done = this.pendingDone;
    this.pendingDone = undefined;
    this.subscription?.remove();
    this.subscription = null;
    this.player?.remove();
    this.player = null;
    done?.();
  }

  async stop(): Promise<void> {
    this.abort?.abort();
    this.abort = null;
    if (this.player) {
      this.player.pause();
      this.finish();
    }
  }
}
