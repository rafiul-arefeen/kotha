/**
 * GET /api/v1/health — lets the Settings screen show whether the laptop
 * server is reachable and Gemini is configured. Never returns the key.
 */
import { PROMPT_VERSION } from '@/services/llm/prompt';
import { geminiConfig } from '@/server/gemini';

export function GET(): Response {
  const { configured, model } = geminiConfig();
  return Response.json({ ok: true, provider: 'gemini', model, configured, prompt_version: PROMPT_VERSION });
}
