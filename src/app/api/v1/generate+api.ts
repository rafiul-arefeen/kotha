/**
 * POST /api/v1/generate — Kotha sentence generation through Gemini.
 *
 * Runs on the laptop inside `npx expo start` (Expo Router API route). The app
 * calls it through RealLLMService; the request/response contract is in
 * docs/API_INTEGRATION.md.
 */
import { buildPrompt } from '@/services/llm/prompt';
import { GeminiError, generateWithGemini } from '@/server/gemini';
import { parseGenerateRequest } from '@/server/parseRequest';
import { allowRequest } from '@/server/rateLimit';

export async function POST(request: Request): Promise<Response> {
  if (!allowRequest()) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const generation = parseGenerateRequest(body);
  if (!generation) {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }

  const started = Date.now();
  try {
    const { response, model } = await generateWithGemini(generation, buildPrompt(generation));
    // Log metadata only — never the user's message.
    console.log(
      `[kotha-api] generate ok · ${model} · ${generation.register} · ${generation.items.length} item(s) · ${Date.now() - started} ms`,
    );
    return Response.json({ ...response, provider: 'gemini', model });
  } catch (error) {
    const status = error instanceof GeminiError ? error.status : 500;
    const code = error instanceof GeminiError ? error.code : 'internal';
    console.warn(`[kotha-api] generate failed · ${code} · ${Date.now() - started} ms · ${(error as Error).message}`);
    return Response.json({ error: code }, { status });
  }
}
