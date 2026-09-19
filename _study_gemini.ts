/**
 * TEMPORARY study script — generates the Condition C (cloud model) stimulus
 * set for the Kotha language-quality evaluation. Uses the SAME prompt and the
 * SAME client the app's server uses, so the study measures the shipped system.
 * Not part of the app. Safe to delete.
 *
 * Reads GEMINI_API_KEY from .env.local at the repo root (same file the dev
 * server uses). Run from the repo root:
 *
 *   npx tsx --tsconfig tsconfig.study.json _study_gemini.ts out/condition_C.csv
 *
 * Optional: DELAY_MS (default 8000) throttles requests so the free-tier
 * per-minute quota is not tripped. The script checkpoints after every case, so
 * if it dies you can rerun the same command and it resumes where it stopped.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

import { buildCases, describeItems, toCsv, toRequest } from './_study_cases';

/** Load .env.local the way the dev server does, so no shell export is needed. */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, '');
      if (value && !process.env[match[1]]) process.env[match[1]] = value;
    }
  }
}

const OUT = process.argv[2] ?? 'condition_C.csv';
/**
 * The free tier's per-minute cap is low. Anything faster than ~20 s between
 * calls trips it, and a tripped primary model silently hands the row to the
 * lite model, which is not the system under test.
 */
const DELAY_MS = Number(process.env.DELAY_MS ?? 20000);
const MAX_RETRIES = 4;

/**
 * The app gives the primary model 8 s and then falls back, because a user is
 * waiting. A benchmark must not do that: a fallback row measures the lite
 * model, not the system. Wait much longer here so the primary model answers.
 */
process.env.KOTHA_TIMEOUTS_MS = process.env.KOTHA_TIMEOUTS_MS ?? '60000,20000';

const header = [
  'case_id',
  'register',
  'input_items',
  'intended_meaning',
  'probe',
  'C_sentence',
  'C_style',
  'C_alternatives',
  'C_register_confidence',
  'C_vocabulary_confidence',
  'C_warnings',
  'C_model',
  'C_latency_ms',
  'C_on_primary_model',
  'prompt_version',
];

/**
 * Proper CSV parse. Handles quoted and unquoted fields, escaped quotes and
 * newlines inside quotes, so a file written by any tool round-trips.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** Rows already done, keyed by case id, so a rerun resumes instead of restarting. */
function loadDone(): Map<string, string[]> {
  const done = new Map<string, string[]>();
  if (!existsSync(OUT)) return done;
  const rows = parseCsv(readFileSync(OUT, 'utf8').replace(/^﻿/, ''));
  if (!rows.length) return done;

  // Find columns by name rather than position, so column order cannot break this.
  const head = rows[0];
  const col = (name: string) => head.indexOf(name);
  const idCol = col('case_id');
  const sentenceCol = col('C_sentence');
  const primaryCol = col('C_on_primary_model');
  if (idCol < 0 || sentenceCol < 0 || primaryCol < 0) {
    console.warn(`  ${OUT} has an unexpected header — ignoring it and starting fresh.`);
    return done;
  }

  for (const parsed of rows.slice(1)) {
    if (parsed.length < head.length) continue;
    const ok = parsed[sentenceCol] && !parsed[sentenceCol].startsWith('ERROR');
    // A row answered by the fallback model is not usable data — retry it.
    const onPrimary = parsed[primaryCol] === 'yes';
    if (parsed[idCol] && ok && onPrimary) done.set(parsed[idCol], parsed);
  }
  return done;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Excel holds an exclusive lock on an open CSV, so a plain write throws EBUSY
 * and loses the run. Write beside the target and rename, retrying if locked.
 */
async function saveCsv(path: string, content: string) {
  const tmp = `${path}.tmp`;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      writeFileSync(tmp, content, 'utf8');
      renameSync(tmp, path);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if ((code !== 'EBUSY' && code !== 'EPERM') || attempt === 5) {
        console.warn(`  could not write ${path} (${code}). Progress kept at ${tmp}`);
        return;
      }
      console.warn(`  ${path} is locked (close it in Excel). Retrying in 3 s...`);
      await sleep(3000);
    }
  }
}

async function main() {
  loadEnv();
  // Imported after the env is populated, because geminiConfig() reads process.env.
  const { buildPrompt, PROMPT_VERSION } = await import('@/services/llm/prompt');
  const { DEFAULT_MODEL, generateWithGemini, GeminiError } = await import('@/server/gemini');

  const cases = buildCases();
  const done = loadDone();
  const rows: string[][] = [];
  let failures = 0;
  let fallbacks = 0;

  console.log(`${cases.length} cases, ${done.size} already done, ${DELAY_MS} ms between calls.`);

  for (const [index, c] of cases.entries()) {
    const existing = done.get(c.id);
    if (existing) {
      rows.push(existing);
      continue;
    }

    let row: string[] | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const request = toRequest(c);
        const started = Date.now();
        const { response, model } = await generateWithGemini(request, buildPrompt(request));
        const latency = Date.now() - started;

        // A fallback answer is not data. Back off and ask the primary model again.
        if (model !== DEFAULT_MODEL && attempt < MAX_RETRIES) {
          const wait = DELAY_MS * (attempt + 1);
          console.warn(`  ${c.id} answered by ${model}, not ${DEFAULT_MODEL}. Waiting ${Math.round(wait / 1000)} s and retrying.`);
          await sleep(wait);
          continue;
        }
        if (model !== DEFAULT_MODEL) fallbacks += 1;

        row = [
          c.id,
          c.register,
          describeItems(c),
          c.intent,
          c.probe,
          response.sentence,
          response.style ?? '',
          (response.alternatives ?? []).map((a) => `${a.text} [${a.style}]`).join(' | '),
          response.register_confidence ?? '',
          response.vocabulary_confidence ?? '',
          (response.warnings ?? [])
            .map((w) => (w.words?.length ? `${w.code}(${w.words.join(',')})` : w.code))
            .join(' | '),
          model,
          String(latency),
          model === DEFAULT_MODEL ? 'yes' : 'NO - fallback model, exclude or rerun',
          PROMPT_VERSION,
        ];
        break;
      } catch (error) {
        const message = (error as Error).message;
        const gerr = error instanceof GeminiError ? error : null;
        console.warn(`  ${c.id} attempt ${attempt}/${MAX_RETRIES} failed: ${message}`);

        if (gerr?.code === 'not_configured') {
          console.error('\nGEMINI_API_KEY is not set. Put it in .env.local at the repo root, then rerun.');
          process.exit(1);
        }

        const fatal = gerr !== null && !gerr.retryable;
        if (fatal || attempt === MAX_RETRIES) {
          failures += 1;
          row = [
            c.id,
            c.register,
            describeItems(c),
            c.intent,
            c.probe,
            `ERROR: ${message}`,
            '', '', '', '', '', '', '', '',
            PROMPT_VERSION,
          ];
          break;
        }
        await sleep(DELAY_MS * attempt * 2);
      }
    }

    if (row) rows.push(row);
    await saveCsv(OUT, toCsv([header, ...rows]));
    console.log(`[${index + 1}/${cases.length}] ${c.id} ${c.register} -> ${rows[rows.length - 1][5].slice(0, 60)}`);

    if (index < cases.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${rows.length} rows -> ${OUT}`);
  if (fallbacks) console.log(`WARNING: ${fallbacks} row(s) answered by the fallback model. Rerun those or report them separately.`);
  if (failures) console.log(`WARNING: ${failures} row(s) failed. Rerun the same command to retry only those.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
