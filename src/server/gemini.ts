/**
 * Server-only Gemini client.
 *
 * Imported only by Expo Router API routes (src/app/api/*). Those run in Node
 * inside the `npx expo start` dev server on the laptop, so GEMINI_API_KEY is
 * read from .env.local on the laptop and is never included in the app bundle.
 */
import { CATEGORY_BY_ID } from '@/data/categories';
import { REGISTER_BY_ID } from '@/data/registers';
import type { WireGenerateResponse } from '@/services/llm/wire';
import type { ConfidenceLevel, GenerationRequest, SentenceStyle, WarningCode } from '@/types';

export const DEFAULT_MODEL = 'gemini-3.5-flash';
/** Used when the main model is overloaded, rate-limited or times out. */
export const FALLBACK_MODEL = 'gemini-3.5-flash-lite';
/** Kotha needs short answers fast; deep reasoning adds seconds of latency. */
const THINKING_LEVEL = 'minimal';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
/**
 * Per-attempt timeouts; together they stay under the app's 15 s timeout.
 * Measured on Kotha prompts: flash ≈ 1.5–4 s typical (outliers ~9 s), flash-lite ≈ 1.1 s.
 */
const TIMEOUTS_MS = [8000, 5000];

const STYLES: SentenceStyle[] = ['direct', 'request', 'permission', 'short', 'warm', 'other'];
const LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low'];
const WARNINGS: WarningCode[] = [
  'register_uncertain',
  'register_conflict',
  'unknown_words',
  'meaning_uncertain',
  'medical_boundary',
];

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    sentence: { type: 'string', description: 'The message in natural Bangla, first person.' },
    style: { type: 'string', enum: STYLES },
    alternatives: {
      type: 'array',
      description: 'Up to 3 different phrasings or readings.',
      items: {
        type: 'object',
        properties: { text: { type: 'string' }, style: { type: 'string', enum: STYLES } },
        required: ['text', 'style'],
      },
    },
    register_confidence: { type: 'string', enum: LEVELS },
    vocabulary_confidence: { type: 'string', enum: LEVELS },
    warnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: WARNINGS },
          words: { type: 'array', items: { type: 'string' } },
        },
        required: ['code'],
      },
    },
  },
  required: ['sentence', 'style', 'alternatives', 'register_confidence', 'vocabulary_confidence', 'warnings'],
};

export type GeminiErrorCode =
  | 'not_configured'
  | 'auth'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'upstream'
  | 'blocked'
  | 'bad_output';

export class GeminiError extends Error {
  readonly code: GeminiErrorCode;
  /** HTTP status the API route should return to the app. */
  readonly status: number;
  /** Whether trying the fallback model could help. */
  readonly retryable: boolean;

  constructor(code: GeminiErrorCode, message: string, status: number, retryable: boolean) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

export function geminiConfig() {
  const key = (process.env.GEMINI_API_KEY ?? '').trim();
  const model = (process.env.GEMINI_MODEL ?? '').trim() || DEFAULT_MODEL;
  return { key, model, configured: key.length > 0 };
}

interface CallOptions {
  key: string;
  model: string;
  system: string;
  user: string;
  temperature: number;
  timeoutMs: number;
  thinking: boolean;
}

async function callModel(options: CallOptions): Promise<string> {
  const { key, model, system, user, temperature, timeoutMs, thinking } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  let data: any;
  try {
    response = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseJsonSchema: RESPONSE_SCHEMA,
          ...(thinking ? { thinkingConfig: { thinkingLevel: THINKING_LEVEL } } : {}),
        },
      }),
      signal: controller.signal,
    });
    data = await response.json().catch(() => null);
  } catch (error) {
    const timedOut = controller.signal.aborted;
    throw new GeminiError(
      timedOut ? 'timeout' : 'network',
      timedOut ? `${model} timed out after ${timeoutMs} ms` : `Could not reach Gemini: ${(error as Error).message}`,
      504,
      true,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const message = String(data?.error?.message ?? `HTTP ${response.status}`);
    if (response.status === 400 && thinking && /thinking/i.test(message)) {
      return callModel({ ...options, thinking: false });
    }
    if (response.status === 401 || response.status === 403 || /api key/i.test(message)) {
      throw new GeminiError('auth', 'Gemini rejected GEMINI_API_KEY', 502, false);
    }
    if (response.status === 429) {
      throw new GeminiError('rate_limited', `${model}: quota or rate limit reached`, 429, true);
    }
    throw new GeminiError(
      'upstream',
      `${model}: HTTP ${response.status} ${message.slice(0, 160)}`,
      502,
      response.status >= 500 || response.status === 404,
    );
  }

  if (data?.promptFeedback?.blockReason) {
    throw new GeminiError('blocked', `Prompt blocked (${data.promptFeedback.blockReason})`, 502, false);
  }
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .filter((part: any) => !part.thought)
    .map((part: any) => part.text ?? '')
    .join('')
    .trim();
  if (!text) {
    throw new GeminiError('bad_output', `${model}: empty response (${candidate?.finishReason ?? 'no candidate'})`, 502, true);
  }
  return text;
}

const clean = (value: unknown, max = 300) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/**
 * Validate the model's JSON and enforce Kotha's rules that must not depend
 * on the model remembering them.
 */
export function sanitizeModelOutput(raw: unknown, request: GenerationRequest): WireGenerateResponse {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const sentence = clean(o.sentence);
  if (!sentence) throw new GeminiError('bad_output', 'Model returned no sentence', 502, true);

  const style = STYLES.includes(o.style) ? (o.style as SentenceStyle) : 'direct';
  const seen = new Set([sentence]);
  const alternatives = (Array.isArray(o.alternatives) ? o.alternatives : [])
    .map((a: any) => ({ text: clean(a?.text), style: STYLES.includes(a?.style) ? (a.style as SentenceStyle) : 'other' }))
    .filter((a: { text: string }) => a.text && !seen.has(a.text) && seen.add(a.text))
    .slice(0, 3);

  let registerConfidence: ConfidenceLevel = LEVELS.includes(o.register_confidence) ? o.register_confidence : 'medium';
  const vocabularyConfidence: ConfidenceLevel = LEVELS.includes(o.vocabulary_confidence) ? o.vocabulary_confidence : 'medium';

  const warnings: { code: WarningCode; words?: string[] }[] = [];
  for (const w of Array.isArray(o.warnings) ? o.warnings : []) {
    if (!WARNINGS.includes(w?.code) || warnings.some((x) => x.code === w.code)) continue;
    const words = Array.isArray(w.words) ? w.words.map((x: unknown) => clean(x, 40)).filter(Boolean).slice(0, 8) : [];
    warnings.push(words.length ? { code: w.code, words } : { code: w.code });
  }

  const register = REGISTER_BY_ID[request.register];
  if (!register.pronounCertain) {
    if (registerConfidence === 'high') registerConfidence = 'medium';
    if (!warnings.some((w) => w.code === 'register_uncertain' || w.code === 'register_conflict')) {
      warnings.unshift({ code: 'register_uncertain' });
    }
  }
  const healthInput = request.items.some((i) => i.category && CATEGORY_BY_ID[i.category]?.id === 'health');
  if (register.id === 'doctor' && healthInput && !warnings.some((w) => w.code === 'medical_boundary')) {
    warnings.push({ code: 'medical_boundary' });
  }

  return {
    sentence,
    style,
    alternatives,
    register_confidence: registerConfidence,
    vocabulary_confidence: vocabularyConfidence,
    warnings,
  };
}

/** Generate with the configured model, falling back to a faster model on transient errors. */
export async function generateWithGemini(
  request: GenerationRequest,
  prompt: { system: string; user: string },
): Promise<{ response: WireGenerateResponse; model: string }> {
  const { key, model } = geminiConfig();
  if (!key) {
    throw new GeminiError('not_configured', 'GEMINI_API_KEY is not set in .env.local', 503, false);
  }

  const models = model === FALLBACK_MODEL ? [model] : [model, FALLBACK_MODEL];
  const temperature = request.variant > 0 ? 0.7 : 0.3;
  let lastError: unknown;

  for (const [attempt, candidate] of models.entries()) {
    try {
      const text = await callModel({
        key,
        model: candidate,
        system: prompt.system,
        user: prompt.user,
        temperature,
        timeoutMs: TIMEOUTS_MS[attempt] ?? 5000,
        thinking: true,
      });
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new GeminiError('bad_output', `${candidate}: response was not valid JSON`, 502, true);
      }
      return { response: sanitizeModelOutput(parsed, request), model: candidate };
    } catch (error) {
      lastError = error;
      if (!(error instanceof GeminiError) || !error.retryable) throw error;
      console.warn(`[kotha-api] ${error.message}${attempt < models.length - 1 ? ' — trying fallback model' : ''}`);
    }
  }
  throw lastError;
}
