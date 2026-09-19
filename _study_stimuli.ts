/**
 * TEMPORARY study script — generates the Condition B (offline composer)
 * stimulus set for the Kotha language-quality evaluation.
 * Not part of the app. Safe to delete.
 *
 *   npx tsx --tsconfig tsconfig.study.json _study_stimuli.ts out/condition_B.csv
 */
import { composeSentence } from '@/services/llm/mock/composer';
import { writeFileSync } from 'node:fs';

import { buildCases, describeItems, toCsv, toRequest } from './_study_cases';

const header = [
  'case_id',
  'register',
  'input_items',
  'intended_meaning',
  'probe',
  'B_sentence',
  'B_style',
  'B_alternatives',
  'B_register_confidence',
  'B_vocabulary_confidence',
  'B_warnings',
];

const rows: string[][] = [header];

for (const c of buildCases()) {
  let sentence = '';
  let style = '';
  let alternatives = '';
  let registerConfidence = '';
  let vocabularyConfidence = '';
  let warnings = '';

  try {
    const result = composeSentence(toRequest(c));
    sentence = result.sentence;
    style = result.style;
    alternatives = result.alternatives.map((a) => `${a.text} [${a.style}]`).join(' | ');
    registerConfidence = result.registerConfidence;
    vocabularyConfidence = result.vocabularyConfidence;
    warnings = result.warnings
      .map((w) => (w.words?.length ? `${w.code}(${w.words.join(',')})` : w.code))
      .join(' | ');
  } catch (error) {
    sentence = `ERROR: ${(error as Error).message}`;
  }

  rows.push([
    c.id,
    c.register,
    describeItems(c),
    c.intent,
    c.probe,
    sentence,
    style,
    alternatives,
    registerConfidence,
    vocabularyConfidence,
    warnings,
  ]);
}

const out = process.argv[2] ?? 'condition_B.csv';
writeFileSync(out, toCsv(rows), 'utf8');
console.log(`${rows.length - 1} cases written to ${out}`);
