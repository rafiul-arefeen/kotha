import { existsSync, readFileSync } from 'node:fs';

async function main() {
  for (const f of ['.env.local', '.env']) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const key = process.env.GEMINI_API_KEY ?? '';
  const model = process.argv[2] ?? 'gemini-3.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 8 } }),
  });
  console.log('model:', model, '| HTTP', res.status);
  const body: any = await res.json().catch(() => null);
  if (res.ok) { console.log('OK - quota available.'); return; }
  console.log('status:', body?.error?.status);
  console.log('message:', body?.error?.message);
  for (const d of body?.error?.details ?? []) {
    if (String(d['@type']).includes('QuotaFailure')) {
      for (const v of d.violations ?? []) console.log('  QUOTA:', v.quotaMetric, '| id:', v.quotaId, '| limit:', v.quotaValue);
    }
    if (String(d['@type']).includes('RetryInfo')) console.log('  retry after:', d.retryDelay);
  }
}
main();
