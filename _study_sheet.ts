/**
 * TEMPORARY study script — merges the condition B and condition C outputs into
 * blinded, shuffled rating sheets (one per rater) plus a private answer key.
 * Not part of the app. Safe to delete.
 *
 *   npx tsx --tsconfig tsconfig.study.json _study_sheet.ts out/condition_B.csv out/condition_C.csv out/
 *
 * Raters must never see the answer key. It is the only file that maps an
 * item_id back to the system that produced it.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { toCsv } from './_study_cases';

const RATERS = Number(process.env.RATERS ?? 3);

function readCsv(path: string): Record<string, string>[] {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  const lines = text.split('\n').filter(Boolean);
  const parse = (line: string) =>
    (line.match(/("([^"]|"")*"|[^,]*)/g) ?? [])
      .filter((_, i) => i % 2 === 0)
      .map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
  const header = parse(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parse(line);
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  });
}

/** Deterministic shuffle so a rerun reproduces the same sheets. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const bPath = process.argv[2] ?? 'condition_B.csv';
const cPath = process.argv[3] ?? 'condition_C.csv';
const outDir = (process.argv[4] ?? '.').replace(/\/?$/, '/');

const bRows = readCsv(bPath);
const cRows = existsSync(cPath) ? readCsv(cPath) : [];
if (!cRows.length) {
  console.warn(`No condition C file at ${cPath} — building a B-only sheet. Rerun once ${cPath} exists.`);
}

type Item = {
  itemId: string;
  caseId: string;
  system: 'B' | 'C';
  register: string;
  input: string;
  intent: string;
  sentence: string;
  isHealth: boolean;
};

const items: Item[] = [];
let n = 1;

const push = (row: Record<string, string>, system: 'B' | 'C') => {
  const sentence = row[`${system}_sentence`] ?? '';
  if (!sentence || sentence.startsWith('ERROR')) return;
  items.push({
    itemId: `I${String(n).padStart(3, '0')}`,
    caseId: row.case_id,
    system,
    register: row.register,
    input: row.input_items,
    intent: row.intended_meaning,
    sentence,
    isHealth: /health|medical|symptom/i.test(row.probe ?? ''),
  });
  n += 1;
};

for (const row of bRows) push(row, 'B');
for (const row of cRows) push(row, 'C');

const sheetHeader = [
  'item_id',
  'who_you_are_speaking_to',
  'what_was_selected',
  'what_the_user_meant',
  'sentence_to_rate',
  'grammatical_1to5',
  'natural_1to5',
  'register_ok_1to5',
  'meaning_ok_1to5',
  'added_content_yes_no',
  'medical_violation_yes_no_na',
  'comment_if_you_scored_1_or_2',
];

const REGISTER_LABEL: Record<string, string> = {
  family: 'Family (parent, sibling, close relative)',
  friend: 'Friend / classmate',
  teacher: 'Teacher',
  doctor: 'Doctor / nurse',
  stranger: 'Stranger (shopkeeper, rickshaw driver)',
  caregiver: 'Carer',
};

for (let r = 1; r <= RATERS; r += 1) {
  const ordered = shuffle(items, 20260919 + r * 7919);
  const rows = [sheetHeader];
  for (const item of ordered) {
    rows.push([
      item.itemId,
      REGISTER_LABEL[item.register] ?? item.register,
      item.input,
      item.intent,
      item.sentence,
      '', '', '', '', '',
      item.isHealth ? '' : 'na',
      '',
    ]);
  }
  const path = `${outDir}rating_sheet_rater_${r}.csv`;
  writeFileSync(path, toCsv(rows), 'utf8');
  console.log(`rater ${r}: ${ordered.length} items -> ${path}`);
}

const keyRows = [['item_id', 'case_id', 'system', 'register', 'input_items', 'sentence']];
for (const item of items) {
  keyRows.push([item.itemId, item.caseId, item.system, item.register, item.input, item.sentence]);
}
writeFileSync(`${outDir}answer_key_DO_NOT_SHARE.csv`, toCsv(keyRows), 'utf8');
console.log(`key: ${items.length} items -> ${outDir}answer_key_DO_NOT_SHARE.csv`);
