import type { GenerationRequest, GenerationResult } from '@/types';

import { LLMError, type LLMService } from './LLMService';
import { fromWireResponse, toWireRequest } from './wire';

/**
 * Calls the Kotha backend: POST {EXPO_PUBLIC_KOTHA_API_URL}/v1/generate.
 *
 * The backend (not this app) holds the LLM provider key and calls the
 * provider. See docs/API_INTEGRATION.md for the request/response contract.
 */
export class RealLLMService implements LLMService {
  readonly kind = 'remote' as const;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl: string, timeoutMs = 15000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  async generate(request: GenerationRequest, options?: { signal?: AbortSignal }): Promise<GenerationResult> {
    if (!this.baseUrl) {
      throw new LLMError('not_configured', 'EXPO_PUBLIC_KOTHA_API_URL is not set');
    }

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);
    const forwardAbort = () => controller.abort();
    options?.signal?.addEventListener('abort', forwardAbort);

    try {
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/v1/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Kotha-Client': 'kotha-android/1.0',
          },
          body: JSON.stringify(toWireRequest(request)),
          signal: controller.signal,
        });
      } catch (error) {
        if (options?.signal?.aborted) throw error;
        throw new LLMError(timedOut ? 'timeout' : 'network', error instanceof Error ? error.message : String(error));
      }

      if (!response.ok) {
        throw new LLMError('http', `Backend returned HTTP ${response.status}`, response.status);
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new LLMError('bad_response', 'Backend response is not valid JSON');
      }
      return fromWireResponse(body, request);
    } finally {
      clearTimeout(timer);
      options?.signal?.removeEventListener('abort', forwardAbort);
    }
  }
}
