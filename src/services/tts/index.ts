import { config } from '../config';
import { DeviceTTSService } from './DeviceTTSService';
import { MockTTSService } from './MockTTSService';
import { RealTTSService } from './RealTTSService';
import type { TTSService } from './TTSService';

export { TTSError } from './TTSService';
export type { SpeakOptions, TTSService, TTSStatus } from './TTSService';

let service: TTSService | null = null;

/** The single place that decides which TTS implementation the app uses. */
export function getTTSService(): TTSService {
  if (!service) {
    if (config.ttsMode === 'remote' && config.apiUrl) service = new RealTTSService(config.apiUrl, config.requestTimeoutMs);
    else if (config.ttsMode === 'mock') service = new MockTTSService();
    else service = new DeviceTTSService();
  }
  return service;
}

export function isTTSMisconfigured(): boolean {
  return config.ttsMode === 'remote' && !config.apiUrl;
}
