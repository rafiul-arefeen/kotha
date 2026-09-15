import type { GenerationRequest, GenerationResult } from '@/types';

import type { LLMService } from './LLMService';
import { composeSentence } from './mock/composer';

/**
 * Offline, deterministic stand-in for a real LLM. Needs no network or API key.
 * A short artificial delay keeps the loading state realistic.
 */
export class MockLLMService implements LLMService {
  readonly kind = 'mock' as const;
  private readonly latencyMs: number;

  constructor(latencyMs = 450) {
    this.latencyMs = latencyMs;
  }

  async generate(request: GenerationRequest, options?: { signal?: AbortSignal }): Promise<GenerationResult> {
    if (this.latencyMs > 0) await wait(this.latencyMs, options?.signal);
    return composeSentence(request);
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('aborted'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('aborted'));
    });
  });
}
