/**
 * The dev server is reachable by anything on the same Wi-Fi, so cap how fast
 * the Gemini key can be used. Simple in-memory sliding window.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const hits: number[] = [];

export function allowRequest(now = Date.now()): boolean {
  while (hits.length && now - hits[0] > WINDOW_MS) hits.shift();
  if (hits.length >= MAX_REQUESTS) return false;
  hits.push(now);
  return true;
}
