/**
 * Provider-agnostic text-to-speech.
 *
 * Implementations:
 *   DeviceTTSService – Android/iOS system TTS via expo-speech (offline, default)
 *   MockTTSService   – no audio; simulates speaking time (development / no voice)
 *   RealTTSService   – Kotha backend `/v1/tts` → audio file played with expo-audio
 *
 * The UI always keeps the text visible, so a TTS failure never blocks
 * communication.
 */

export const BANGLA_LANGUAGE = 'bn-BD';

export interface SpeakOptions {
  /** 1.0 is normal speed. */
  rate?: number;
  onStart?: () => void;
  /** Called when speech finishes or is stopped. */
  onDone?: () => void;
  onError?: (error: TTSError) => void;
}

export type VoiceAvailability = 'available' | 'missing' | 'unknown';

export interface TTSStatus {
  kind: 'device' | 'mock' | 'remote';
  banglaVoice: VoiceAvailability;
}

export interface TTSService {
  readonly kind: 'device' | 'mock' | 'remote';
  getStatus(): Promise<TTSStatus>;
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): Promise<void>;
}

export type TTSErrorCode = 'not_configured' | 'network' | 'bad_response' | 'playback';

export class TTSError extends Error {
  readonly code: TTSErrorCode;

  constructor(code: TTSErrorCode, message: string) {
    super(message);
    this.name = 'TTSError';
    this.code = code;
  }
}
