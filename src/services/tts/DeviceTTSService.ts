import * as Speech from 'expo-speech';

import { BANGLA_LANGUAGE, TTSError, type SpeakOptions, type TTSService, type TTSStatus, type VoiceAvailability } from './TTSService';

/**
 * On-device TTS through expo-speech. Works offline when the phone has a Bangla
 * voice installed (Android: Settings → Text-to-speech → Google → install
 * "বাংলা (বাংলাদেশ)").
 */
export class DeviceTTSService implements TTSService {
  readonly kind = 'device' as const;
  private voiceId: string | undefined;
  private availability: VoiceAvailability = 'unknown';
  private checked = false;

  private async resolveVoice(): Promise<void> {
    if (this.checked) return;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      // Some Android devices return an empty list until the engine warms up;
      // stay "unknown" and try again next time in that case.
      if (voices.length === 0) return;
      this.checked = true;
      const bangla = voices.filter((v) => v.language?.toLowerCase().replace('_', '-').startsWith('bn'));
      const preferred =
        bangla.find((v) => v.language.toLowerCase().replace('_', '-') === 'bn-bd') ?? bangla[0];
      this.voiceId = preferred?.identifier;
      this.availability = preferred ? 'available' : 'missing';
    } catch {
      this.availability = 'unknown';
    }
  }

  async getStatus(): Promise<TTSStatus> {
    await this.resolveVoice();
    return { kind: 'device', banglaVoice: this.availability };
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    await this.resolveVoice();
    await Speech.stop();
    Speech.speak(text, {
      language: BANGLA_LANGUAGE,
      voice: this.voiceId,
      rate: options.rate ?? 1,
      onStart: options.onStart,
      onDone: options.onDone,
      onStopped: options.onDone,
      onError: (error) => options.onError?.(new TTSError('playback', error.message)),
    });
  }

  async stop(): Promise<void> {
    await Speech.stop();
  }
}
