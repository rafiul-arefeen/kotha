import { getCachedGeneration, putCachedGeneration } from '@/storage/generationCache';
import type { GenerationRequest, GenerationResult } from '@/types';

import { config } from '../config';
import { isRecoverable, type LLMService } from './LLMService';
import { MockLLMService } from './MockLLMService';
import { RealLLMService } from './RealLLMService';

export { LLMError } from './LLMService';
export type { LLMService } from './LLMService';

let service: LLMService | null = null;

/** The single place that decides which implementation the app uses. */
export function getLLMService(): LLMService {
  if (!service) {
    service =
      config.llmMode === 'remote' && config.apiUrl
        ? new RealLLMService(config.apiUrl, config.requestTimeoutMs)
        : new MockLLMService();
  }
  return service;
}

export interface LLMStatus {
  active: 'mock' | 'remote';
  /** True when remote mode was requested but no API URL is set. */
  misconfigured: boolean;
  apiUrl: string;
}

export function getLLMStatus(): LLMStatus {
  return {
    active: getLLMService().kind,
    misconfigured: config.llmMode === 'remote' && !config.apiUrl,
    apiUrl: config.apiUrl,
  };
}

/**
 * Generate a sentence with offline fallbacks:
 * remote → cached result for the same input → offline mock (flagged).
 */
export async function generateSentence(
  request: GenerationRequest,
  options?: { signal?: AbortSignal },
): Promise<GenerationResult> {
  const llm = getLLMService();
  try {
    const result = await llm.generate(request, options);
    void putCachedGeneration(request, result);
    return result;
  } catch (error) {
    if (llm.kind === 'mock' || options?.signal?.aborted || !isRecoverable(error)) throw error;
    console.warn('[llm] remote generation failed, using offline fallback', error);

    const cached = await getCachedGeneration(request);
    if (cached) {
      return { ...cached, source: 'cache', warnings: [{ code: 'offline_fallback' }, ...cached.warnings] };
    }
    const offline = await new MockLLMService(0).generate(request);
    return { ...offline, warnings: [{ code: 'offline_fallback' }, ...offline.warnings] };
  }
}
