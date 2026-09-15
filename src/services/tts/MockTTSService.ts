import type { SpeakOptions, TTSService, TTSStatus } from './TTSService';

/**
 * Plays no audio. Simulates the time it would take to speak so the speaking
 * indicator and flows can be tested on devices without a Bangla voice.
 */
export class MockTTSService implements TTSService {
  readonly kind = 'mock' as const;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingDone: (() => void) | undefined;

  async getStatus(): Promise<TTSStatus> {
    return { kind: 'mock', banglaVoice: 'unknown' };
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    await this.stop();
    const rate = options.rate && options.rate > 0 ? options.rate : 1;
    const duration = Math.min(8000, Math.max(900, (text.length * 75) / rate));
    this.pendingDone = options.onDone;
    options.onStart?.();
    this.timer = setTimeout(() => {
      this.timer = null;
      const done = this.pendingDone;
      this.pendingDone = undefined;
      done?.();
    }, duration);
  }

  async stop(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const done = this.pendingDone;
    this.pendingDone = undefined;
    done?.();
  }
}
