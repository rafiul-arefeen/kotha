import type { GenerationRequest, GenerationResult } from '@/types';

/**
 * Provider-agnostic sentence generation.
 *
 * UI code must only talk to this interface (via `getLLMService()` in
 * ./index.ts). Provider-specific HTTP calls live in RealLLMService or, in
 * production, on the Kotha backend.
 */
export interface LLMService {
  readonly kind: 'mock' | 'remote';
  generate(request: GenerationRequest, options?: { signal?: AbortSignal }): Promise<GenerationResult>;
}

export type LLMErrorCode = 'empty_input' | 'not_configured' | 'network' | 'timeout' | 'http' | 'bad_response';

export class LLMError extends Error {
  readonly code: LLMErrorCode;
  readonly status?: number;

  constructor(code: LLMErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    this.status = status;
  }
}

/** Network-type failures where falling back to cache / offline mock is safe. */
export function isRecoverable(error: unknown): boolean {
  return error instanceof LLMError && ['network', 'timeout', 'http', 'bad_response', 'not_configured'].includes(error.code);
}
