/**
 * JSON contract between the app and the Kotha backend.
 * Documented in docs/API_INTEGRATION.md — change both together.
 */
import { REGISTER_BY_ID } from '@/data/registers';
import type {
  ConfidenceLevel,
  GenerationRequest,
  GenerationResult,
  GenerationWarning,
  SentenceOption,
  SentenceStyle,
  WarningCode,
} from '@/types';

import { LLMError } from './LLMService';
import { buildPrompt, PROMPT_VERSION } from './prompt';

export interface WireGenerateRequest {
  prompt_version: string;
  language: 'bn-BD';
  register: { id: string; label: string; pronoun: 'tumi' | 'apni'; pronoun_certain: boolean };
  items: { source: 'symbol' | 'keyword'; text: string; symbol_id?: string; category?: string }[];
  symbols: string[];
  keywords: string[];
  style: GenerationRequest['style'];
  variant: number;
  prompt: { system: string; user: string };
}

export interface WireGenerateResponse {
  sentence: string;
  style?: SentenceStyle;
  alternatives?: { text: string; style?: SentenceStyle }[];
  register_confidence?: ConfidenceLevel;
  vocabulary_confidence?: ConfidenceLevel;
  warnings?: { code: WarningCode; words?: string[] }[];
}

const STYLES: SentenceStyle[] = ['direct', 'request', 'permission', 'short', 'warm', 'other'];
const LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low'];
const WARNINGS: WarningCode[] = [
  'register_uncertain',
  'register_conflict',
  'unknown_words',
  'meaning_uncertain',
  'medical_boundary',
  'offline_fallback',
];

export function toWireRequest(request: GenerationRequest): WireGenerateRequest {
  const register = REGISTER_BY_ID[request.register];
  return {
    prompt_version: PROMPT_VERSION,
    language: 'bn-BD',
    register: {
      id: register.id,
      label: register.label,
      pronoun: register.pronoun,
      pronoun_certain: register.pronounCertain,
    },
    items: request.items.map((i) => ({
      source: i.source,
      text: i.text,
      ...(i.symbolId ? { symbol_id: i.symbolId } : {}),
      ...(i.category ? { category: i.category } : {}),
    })),
    symbols: request.items.filter((i) => i.source === 'symbol').map((i) => i.text),
    keywords: request.items.filter((i) => i.source === 'keyword').map((i) => i.text),
    style: request.style,
    variant: request.variant,
    prompt: buildPrompt(request),
  };
}

/**
 * Validate a backend response. Missing confidence values are treated as
 * "medium" so the user is asked to check rather than silently trusting it.
 */
export function fromWireResponse(body: unknown, request: GenerationRequest): GenerationResult {
  if (!body || typeof body !== 'object') throw new LLMError('bad_response', 'Response is not a JSON object');
  const b = body as Partial<WireGenerateResponse>;
  const sentence = typeof b.sentence === 'string' ? b.sentence.trim() : '';
  if (!sentence) throw new LLMError('bad_response', 'Response has no "sentence"');

  const style = (s: unknown): SentenceStyle => (STYLES.includes(s as SentenceStyle) ? (s as SentenceStyle) : 'direct');
  const level = (l: unknown): ConfidenceLevel => (LEVELS.includes(l as ConfidenceLevel) ? (l as ConfidenceLevel) : 'medium');

  const alternatives: SentenceOption[] = Array.isArray(b.alternatives)
    ? b.alternatives
        .filter((a) => a && typeof a.text === 'string' && a.text.trim() && a.text.trim() !== sentence)
        .slice(0, 3)
        .map((a) => ({ text: a.text.trim(), style: style(a.style) }))
    : [];

  const warnings: GenerationWarning[] = Array.isArray(b.warnings)
    ? b.warnings
        .filter((w) => w && WARNINGS.includes(w.code))
        .map((w) => ({
          code: w.code,
          words: Array.isArray(w.words) ? w.words.filter((x) => typeof x === 'string') : undefined,
        }))
    : [];

  const registerConfidence = level(b.register_confidence);
  if (registerConfidence !== 'high' && !warnings.some((w) => w.code.startsWith('register_'))) {
    warnings.unshift({ code: 'register_uncertain' });
  }

  return {
    sentence,
    style: style(b.style),
    alternatives,
    registerConfidence,
    vocabularyConfidence: level(b.vocabulary_confidence),
    warnings,
    register: request.register,
    source: 'remote',
    createdAt: Date.now(),
  };
}
