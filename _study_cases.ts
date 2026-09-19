/**
 * TEMPORARY study script — the shared stimulus set for the Kotha
 * language-quality evaluation. Imported by _study_stimuli.ts (condition B)
 * and _study_gemini.ts (condition C) so both conditions see identical input.
 * Not part of the app. Safe to delete.
 */
import type { GenerationRequest, RegisterId, RequestItem } from '@/types';

export type Case = {
  id: string;
  register: RegisterId;
  items: RequestItem[];
  /** What this case is meant to probe. Never shown to raters. */
  probe: string;
  /** Plain-English description of what the user meant. Shown to raters. */
  intent: string;
};

const sym = (symbolId: string, text: string, category: RequestItem['category']): RequestItem => ({
  source: 'symbol',
  text,
  symbolId,
  category,
});

const kw = (text: string): RequestItem => ({ source: 'keyword', text });

export const REGISTERS: RegisterId[] = ['family', 'friend', 'teacher', 'doctor', 'stranger', 'caregiver'];

/** Block A: 8 base inputs crossed with all 6 registers = 48 cases. */
const BASE = [
  {
    key: 'water',
    items: () => [sym('water', 'পানি', 'needs'), sym('want', 'চাই', 'needs')],
    intent: 'Wants some water.',
    probe: 'core / flagship example',
  },
  {
    key: 'toilet',
    items: () => [sym('toilet', 'টয়লেট', 'needs')],
    intent: 'Needs to go to the toilet.',
    probe: 'core / permission act',
  },
  {
    key: 'legpain',
    items: () => [sym('pain', 'ব্যথা', 'health'), sym('leg', 'পা', 'health'), kw('খুব')],
    intent: 'Their leg hurts a lot.',
    probe: 'health symptom + intensifier',
  },
  {
    key: 'turnover',
    items: () => [sym('help', 'সাহায্য', 'needs'), sym('turn_over', 'পাশ ফেরা', 'needs')],
    intent: 'Wants help turning over in bed.',
    probe: 'assistance request',
  },
  {
    key: 'tired',
    items: () => [sym('tired', 'ক্লান্ত', 'feelings')],
    intent: 'Feels tired.',
    probe: 'single feeling / state',
  },
  {
    key: 'norice',
    items: () => [sym('rice', 'ভাত', 'food'), sym('no', 'না', 'phrases')],
    intent: 'Does not want to eat rice.',
    probe: 'negation',
  },
  {
    key: 'rickshaw',
    items: () => [sym('rickshaw', 'রিকশা', 'places'), sym('call', 'ডাকা', 'actions')],
    intent: 'Wants someone to call a rickshaw.',
    probe: 'listener-directed action',
  },
  {
    key: 'outside',
    items: () => [sym('outside', 'বাইরে', 'places'), sym('go', 'যাওয়া', 'actions')],
    intent: 'Wants to go outside.',
    probe: 'want + place + movement',
  },
];

/** Block B: 12 targeted hard cases. */
const HARD: Case[] = [
  {
    id: 'B01',
    register: 'family',
    items: [kw('আম্মু'), sym('outside', 'বাইরে', 'places')],
    probe: 'ambiguous: go outside WITH mum, or ask mum to take them',
    intent: 'Something about mum and going outside — genuinely ambiguous.',
  },
  {
    id: 'B02',
    register: 'family',
    items: [sym('want', 'চাই', 'needs'), kw('ঝালমুড়ি')],
    probe: 'unknown word (not in lexicon)',
    intent: 'Wants jhalmuri (a street snack).',
  },
  {
    id: 'B03',
    register: 'teacher',
    items: [kw('তুমি'), sym('help', 'সাহায্য', 'needs')],
    probe: 'register conflict: familiar pronoun typed to a teacher',
    intent: 'Asking the teacher for help, but typed the familiar pronoun.',
  },
  {
    id: 'B04',
    register: 'family',
    items: [kw('স্যার'), sym('water', 'পানি', 'needs')],
    probe: 'register conflict: honorific term used with family',
    intent: 'Asking for water, but typed a formal term of address.',
  },
  {
    id: 'B05',
    register: 'doctor',
    items: [sym('headache', 'মাথা ব্যথা', 'health'), sym('medicine', 'ওষুধ', 'health')],
    probe: 'medical boundary',
    intent: 'Has a headache and wants to mention medicine.',
  },
  {
    id: 'B06',
    register: 'doctor',
    items: [sym('fever', 'জ্বর', 'health'), sym('medicine', 'ওষুধ', 'health'), kw('তিন দিন')],
    probe: 'medical boundary + duration',
    intent: 'Has had a fever for three days, wants to mention medicine.',
  },
  {
    id: 'B07',
    register: 'caregiver',
    items: [sym('blanket', 'কম্বল', 'needs'), sym('cold', 'ঠান্ডা', 'feelings')],
    probe: 'carer register uncertainty',
    intent: 'Feels cold and wants a blanket.',
  },
  {
    id: 'B08',
    register: 'stranger',
    items: [sym('urgent_help', 'জরুরি সাহায্য', 'emergency'), sym('fell', 'পড়ে গেছি', 'emergency')],
    probe: 'urgent / emergency brevity',
    intent: 'They have fallen and need urgent help.',
  },
  {
    id: 'B09',
    register: 'family',
    items: [
      { source: 'symbol', text: 'নামাজ', symbolId: 'custom_prayer', category: 'phrases', custom: true },
      sym('want', 'চাই', 'needs'),
    ],
    probe: 'custom/relabelled symbol added by an educator',
    intent: 'Wants to pray (namaz) — added as a custom symbol.',
  },
  {
    id: 'B10',
    register: 'family',
    items: [
      sym('mother', 'মা', 'people'),
      sym('hospital', 'হাসপাতাল', 'places'),
      sym('go', 'যাওয়া', 'actions'),
      sym('medicine', 'ওষুধ', 'health'),
      sym('want', 'চাই', 'needs'),
    ],
    probe: 'long input, 5 items',
    intent: 'Wants to go to the hospital with mum to get medicine.',
  },
  {
    id: 'B11',
    register: 'doctor',
    items: [sym('breath', 'শ্বাসকষ্ট', 'health')],
    probe: 'single high-stakes symptom',
    intent: 'Is having difficulty breathing.',
  },
  {
    id: 'B12',
    register: 'friend',
    items: [sym('sorry', 'দুঃখিত', 'phrases'), sym('sad', 'মন খারাপ', 'feelings')],
    probe: 'phrase + feeling combination',
    intent: 'Feels sad and wants to apologise.',
  },
];

/**
 * Reduced set used when the cloud model's daily free-tier quota (20 requests)
 * cannot cover all 60 cases. Keeps both fully crossed register blocks — the
 * project's central claim is that one input yields different wording per
 * listener, so those 12 cases are not negotiable — plus the eight probes that
 * test a distinct mechanism. Set STUDY_SUBSET=1 to use it.
 */
export const SUBSET_IDS = new Set([
  // water + want, all six registers
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06',
  // toilet, all six registers
  'A07', 'A08', 'A09', 'A10', 'A11', 'A12',
  // one probe per mechanism
  'B01', // ambiguity
  'B02', // unknown word
  'B03', // register conflict
  'B05', // medical boundary
  'B07', // carer uncertainty
  'B08', // urgent brevity
  'B09', // custom symbol
  'B11', // single high-stakes symptom
]);

export function buildCases(): Case[] {
  const cases: Case[] = [];
  let n = 1;
  for (const base of BASE) {
    for (const register of REGISTERS) {
      cases.push({
        id: `A${String(n).padStart(2, '0')}`,
        register,
        items: base.items(),
        probe: base.probe,
        intent: base.intent,
      });
      n += 1;
    }
  }
  const all = [...cases, ...HARD];
  return process.env.STUDY_SUBSET ? all.filter((c) => SUBSET_IDS.has(c.id)) : all;
}

export function toRequest(c: Case): GenerationRequest {
  return { items: c.items, register: c.register, style: 'auto', variant: 0 };
}

export function describeItems(c: Case): string {
  return c.items.map((i) => `${i.text}${i.source === 'keyword' ? ' (typed)' : ''}`).join(' + ');
}

export function csvCell(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function toCsv(rows: string[][]): string {
  return `﻿${rows.map((r) => r.map(csvCell).join(',')).join('\n')}`;
}
