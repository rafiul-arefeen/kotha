/**
 * Bangla lexicon for the offline mock generator.
 *
 * The mock engine is rule-based: it maps selected symbols / typed keywords to
 * lexemes, then fills hand-written Bangla templates. It exists so the app is
 * fully usable without an API key and offline, and to give a real LLM a
 * baseline to be compared against.
 *
 * Lexeme `id`s for built-in symbols match `src/data/symbols.ts`.
 * `forms` are surface strings a user might type (matched after NFC
 * normalisation). Templates use:
 *   {w}    – the word as the user selected/typed it
 *   {b}    – body part in locative case (পায়ে)
 *   {base} – body part in base form (পা)
 */
import type { RegisterId } from '@/types';

export type VerbId =
  | 'eat'
  | 'go'
  | 'sleep'
  | 'rest'
  | 'play'
  | 'watch'
  | 'listen'
  | 'read'
  | 'talk'
  | 'sit'
  | 'bathe'
  | 'turn'
  | 'answer';

export interface VerbForms {
  /** Infinitive used with চাই / পারি: খেতে */
  inf: string;
  /** Present first person, used for casual permission: খাই? */
  subj: string;
  /** Future first person: খাব */
  fut: string;
}

export const VERBS: Record<VerbId, VerbForms> = {
  eat: { inf: 'খেতে', subj: 'খাই', fut: 'খাব' },
  go: { inf: 'যেতে', subj: 'যাই', fut: 'যাব' },
  sleep: { inf: 'ঘুমাতে', subj: 'ঘুমাই', fut: 'ঘুমাব' },
  rest: { inf: 'বিশ্রাম নিতে', subj: 'বিশ্রাম নিই', fut: 'বিশ্রাম নেব' },
  play: { inf: 'খেলতে', subj: 'খেলি', fut: 'খেলব' },
  watch: { inf: 'দেখতে', subj: 'দেখি', fut: 'দেখব' },
  listen: { inf: 'শুনতে', subj: 'শুনি', fut: 'শুনব' },
  read: { inf: 'পড়তে', subj: 'পড়ি', fut: 'পড়ব' },
  talk: { inf: 'কথা বলতে', subj: 'কথা বলি', fut: 'কথা বলব' },
  sit: { inf: 'বসতে', subj: 'বসি', fut: 'বসব' },
  bathe: { inf: 'গোসল করতে', subj: 'গোসল করি', fut: 'গোসল করব' },
  turn: { inf: 'পাশ ফিরতে', subj: 'পাশ ফিরি', fut: 'পাশ ফিরব' },
  answer: { inf: 'উত্তর দিতে', subj: 'উত্তর দিই', fut: 'উত্তর দেব' },
};

export type ActId = 'give' | 'help' | 'call' | 'take' | 'wait' | 'stop' | 'come' | 'repeat';

/** Verb phrases directed at the listener, by pronoun level. */
export interface ActForms {
  /** তুমি imperative: দাও */
  tImp: string;
  /** তুমি question: দেবে */
  tQ: string;
  /** আপনি imperative: দিন */
  aImp: string;
  /** আপনি polite question: দিতে পারবেন */
  aQ: string;
  /** Negative imperative, তুমি / আপনি */
  tNeg: string;
  aNeg: string;
}

export const ACTS: Record<ActId, ActForms> = {
  give: { tImp: 'দাও', tQ: 'দেবে', aImp: 'দিন', aQ: 'দিতে পারবেন', tNeg: 'দিও না', aNeg: 'দেবেন না' },
  help: {
    tImp: 'সাহায্য করো',
    tQ: 'সাহায্য করবে',
    aImp: 'সাহায্য করুন',
    aQ: 'সাহায্য করতে পারবেন',
    tNeg: 'সাহায্য কোরো না',
    aNeg: 'সাহায্য করবেন না',
  },
  call: { tImp: 'ডেকে দাও', tQ: 'ডেকে দেবে', aImp: 'ডেকে দিন', aQ: 'ডেকে দিতে পারবেন', tNeg: 'ডেকো না', aNeg: 'ডাকবেন না' },
  take: {
    tImp: 'নিয়ে যাও',
    tQ: 'নিয়ে যাবে',
    aImp: 'নিয়ে যান',
    aQ: 'নিয়ে যেতে পারবেন',
    tNeg: 'নিয়ে যেও না',
    aNeg: 'নিয়ে যাবেন না',
  },
  wait: {
    tImp: 'অপেক্ষা করো',
    tQ: 'অপেক্ষা করবে',
    aImp: 'অপেক্ষা করুন',
    aQ: 'অপেক্ষা করবেন',
    tNeg: 'অপেক্ষা কোরো না',
    aNeg: 'অপেক্ষা করবেন না',
  },
  stop: { tImp: 'থামো', tQ: 'থামবে', aImp: 'থামুন', aQ: 'থামবেন', tNeg: 'থেমো না', aNeg: 'থামবেন না' },
  come: { tImp: 'এসো', tQ: 'আসবে', aImp: 'আসুন', aQ: 'আসবেন', tNeg: 'এসো না', aNeg: 'আসবেন না' },
  repeat: {
    tImp: 'আবার বলো',
    tQ: 'আরেকবার বলবে',
    aImp: 'আবার বলুন',
    aQ: 'আরেকবার বলবেন',
    tNeg: 'আর বোলো না',
    aNeg: 'আর বলবেন না',
  },
};

interface Base {
  id: string;
  forms: string[];
}

/**
 * mass: একটু পানি · count: একটা কলা · thing: ফোনটা (a specific personal item)
 * plain: no quantifier (used for words the lexicon does not know)
 */
export type Unit = 'mass' | 'count' | 'thing' | 'plain';

export interface ObjectLex extends Base {
  kind: 'object';
  unit: Unit;
  /** Natural verb for this object (পানি → খাওয়া, টিভি → দেখা). */
  verb?: VerbId;
  /** Prefer "আমার X লাগবে" as the plain statement. */
  needFirst?: boolean;
  /** Health-related item: triggers the medical-boundary note for doctors. */
  medical?: boolean;
}

export interface TransportLex extends Base {
  kind: 'transport';
}

export interface PlaceLex extends Base {
  kind: 'place';
  /** Locative overrides by surface form; others use the heuristic. */
  locBy?: Record<string, string>;
}

export interface PersonLex extends Base {
  kind: 'person';
  /** Genitive overrides by surface form (মা → মায়ের). */
  genBy?: Record<string, string>;
  /** Say "আমার আম্মুকে…" when talking to someone outside the family. */
  possessive: boolean;
  /** Can be used as a vocative: "আম্মু, …" */
  vocative: boolean;
  /** When the listener *is* this person, the symbol names the addressee. */
  addressee?: RegisterId;
}

export interface FeelingLex extends Base {
  kind: 'feeling';
  plain: string;
  strong: string;
  short: string;
  neg: string;
}

export interface SymptomLex extends Base {
  kind: 'symptom';
  plain: string;
  strong: string;
  short: string;
  neg: string;
  /** Present when the symptom can be located on a body part. */
  body?: { plain: string; strong: string; short: string };
}

export interface BodyLex extends Base {
  kind: 'body';
  locBy?: Record<string, string>;
}

export interface ActivityLex extends Base {
  kind: 'activity';
  verb: VerbId;
  /** Overrides VERBS[verb] – used for educator-added action symbols. */
  verbForms?: VerbForms;
}

export interface ActLex extends Base {
  kind: 'act';
  act: ActId;
}

export interface DesireLex extends Base {
  kind: 'desire';
  /** লাগবে / দরকার rather than চাই */
  need: boolean;
}

export interface PhraseLex extends Base {
  kind: 'phrase';
  tumi: string;
  apni: string;
  shortT?: string;
  shortA?: string;
  warmT?: string;
  warmA?: string;
  reqT?: string;
  reqA?: string;
  /** Unusual to say to teachers, doctors or strangers (e.g. ভালোবাসি). */
  intimate?: boolean;
  /** "না" – turns the neighbouring clause negative when combined. */
  negator?: boolean;
  /** "দয়া করে" – makes the request politer when combined. */
  please?: boolean;
  position: 'start' | 'end';
}

export interface UrgentLex extends Base {
  kind: 'urgent';
  direct: string;
  reqT: string;
  reqA: string;
  short: string;
}

export interface ModLex extends Base {
  kind: 'mod';
  mod: 'intensity' | 'softener' | 'now' | 'later' | 'more' | 'self';
}

export interface PronounLex extends Base {
  kind: 'pronoun';
  pronoun: 'tumi' | 'apni' | 'tui';
}

export interface HonorificLex extends Base {
  kind: 'honorific';
}

export type Lexeme =
  | ObjectLex
  | TransportLex
  | PlaceLex
  | PersonLex
  | FeelingLex
  | SymptomLex
  | BodyLex
  | ActivityLex
  | ActLex
  | DesireLex
  | PhraseLex
  | UrgentLex
  | ModLex
  | PronounLex
  | HonorificLex;

export const LEXICON: Lexeme[] = [
  // ---- Objects & food ------------------------------------------------------
  { id: 'water', kind: 'object', forms: ['পানি', 'জল'], unit: 'mass', verb: 'eat' },
  { id: 'food', kind: 'object', forms: ['খাবার', 'খানা'], unit: 'mass', verb: 'eat' },
  { id: 'rice', kind: 'object', forms: ['ভাত'], unit: 'mass', verb: 'eat' },
  { id: 'dal', kind: 'object', forms: ['ডাল'], unit: 'mass', verb: 'eat' },
  { id: 'fish', kind: 'object', forms: ['মাছ'], unit: 'mass', verb: 'eat' },
  { id: 'egg', kind: 'object', forms: ['ডিম'], unit: 'count', verb: 'eat' },
  { id: 'roti', kind: 'object', forms: ['রুটি'], unit: 'count', verb: 'eat' },
  { id: 'milk', kind: 'object', forms: ['দুধ'], unit: 'mass', verb: 'eat' },
  { id: 'tea', kind: 'object', forms: ['চা'], unit: 'mass', verb: 'eat' },
  { id: 'fruit', kind: 'object', forms: ['ফল'], unit: 'mass', verb: 'eat' },
  { id: 'banana', kind: 'object', forms: ['কলা'], unit: 'count', verb: 'eat' },
  { id: 'biscuit', kind: 'object', forms: ['বিস্কুট'], unit: 'count', verb: 'eat' },
  { id: 'juice', kind: 'object', forms: ['জুস'], unit: 'mass', verb: 'eat' },
  { id: 'muri', kind: 'object', forms: ['মুড়ি'], unit: 'mass', verb: 'eat' },
  { id: 'mango', kind: 'object', forms: ['আম', 'আপেল', 'মিষ্টি', 'আইসক্রিম'], unit: 'count', verb: 'eat' },
  { id: 'medicine', kind: 'object', forms: ['ওষুধ', 'ঔষধ'], unit: 'thing', needFirst: true, medical: true },
  { id: 'blanket', kind: 'object', forms: ['কম্বল', 'কাঁথা'], unit: 'thing' },
  { id: 'pillow', kind: 'object', forms: ['বালিশ'], unit: 'thing' },
  { id: 'phone', kind: 'object', forms: ['ফোন', 'মোবাইল'], unit: 'thing' },
  { id: 'glasses', kind: 'object', forms: ['চশমা'], unit: 'thing' },
  { id: 'wheelchair', kind: 'object', forms: ['হুইলচেয়ার'], unit: 'thing', needFirst: true },
  { id: 'tissue', kind: 'object', forms: ['টিস্যু'], unit: 'count' },
  { id: 'tv', kind: 'object', forms: ['টিভি', 'কার্টুন', 'ভিডিও'], unit: 'mass', verb: 'watch' },
  { id: 'song', kind: 'object', forms: ['গান'], unit: 'mass', verb: 'listen' },
  { id: 'book', kind: 'object', forms: ['বই', 'গল্প'], unit: 'thing', verb: 'read' },
  { id: 'toy', kind: 'object', forms: ['খেলনা', 'বল'], unit: 'thing', verb: 'play' },

  { id: 'rickshaw', kind: 'transport', forms: ['রিকশা', 'সিএনজি', 'গাড়ি', 'অটো'] },

  // ---- Places --------------------------------------------------------------
  { id: 'home', kind: 'place', forms: ['বাড়ি', 'বাসা'], locBy: { বাড়ি: 'বাড়ি' } },
  { id: 'outside', kind: 'place', forms: ['বাইরে'], locBy: { বাইরে: 'বাইরে' } },
  { id: 'toilet', kind: 'place', forms: ['টয়লেট', 'বাথরুম'] },
  { id: 'school', kind: 'place', forms: ['স্কুল', 'ক্লাস', 'মাদ্রাসা'] },
  { id: 'hospital', kind: 'place', forms: ['হাসপাতাল', 'ক্লিনিক'] },
  { id: 'park', kind: 'place', forms: ['পার্ক', 'মাঠ'] },
  { id: 'shop', kind: 'place', forms: ['দোকান', 'বাজার'] },
  { id: 'bed', kind: 'place', forms: ['বিছানা'] },
  { id: 'room', kind: 'place', forms: ['ঘর', 'রুম', 'বারান্দা', 'ছাদ'] },
  { id: 'mosque', kind: 'place', forms: ['মসজিদ'] },
  { id: 'temple', kind: 'place', forms: ['মন্দির'] },

  // ---- People --------------------------------------------------------------
  {
    id: 'mother',
    kind: 'person',
    forms: ['মা', 'আম্মু', 'আম্মা', 'মামণি'],
    genBy: { মা: 'মায়ের' },
    possessive: true,
    vocative: true,
  },
  { id: 'father', kind: 'person', forms: ['বাবা', 'আব্বু', 'আব্বা'], possessive: true, vocative: true },
  {
    id: 'brother',
    kind: 'person',
    forms: ['ভাই', 'ভাইয়া'],
    genBy: { ভাই: 'ভাইয়ের' },
    possessive: true,
    vocative: true,
  },
  { id: 'sister', kind: 'person', forms: ['বোন', 'আপু'], possessive: true, vocative: true },
  { id: 'grandparent', kind: 'person', forms: ['নানু', 'দাদু', 'নানি', 'দাদি'], possessive: true, vocative: true },
  { id: 'friend', kind: 'person', forms: ['বন্ধু'], possessive: true, vocative: false, addressee: 'friend' },
  { id: 'teacher', kind: 'person', forms: ['শিক্ষক', 'টিচার'], possessive: false, vocative: false, addressee: 'teacher' },
  { id: 'doctor', kind: 'person', forms: ['ডাক্তার'], possessive: false, vocative: false, addressee: 'doctor' },
  { id: 'nurse', kind: 'person', forms: ['নার্স'], possessive: false, vocative: false },

  // ---- Feelings ------------------------------------------------------------
  { id: 'happy', kind: 'feeling', forms: ['খুশি', 'আনন্দ'], plain: 'আমি খুশি।', strong: 'আমি খুব খুশি।', short: 'খুশি!', neg: 'আমি খুশি না।' },
  { id: 'sad', kind: 'feeling', forms: ['মন খারাপ', 'দুঃখ'], plain: 'আমার {w} লাগছে।', strong: 'আমার খুব {w} লাগছে।', short: '{w}।', neg: 'আমার {w} লাগছে না।' },
  { id: 'angry', kind: 'feeling', forms: ['রাগ'], plain: 'আমার রাগ লাগছে।', strong: 'আমার খুব রাগ লাগছে।', short: 'রাগ লাগছে।', neg: 'আমার রাগ লাগছে না।' },
  { id: 'scared', kind: 'feeling', forms: ['ভয়', 'ভয় লাগছে'], plain: 'আমার ভয় লাগছে।', strong: 'আমার খুব ভয় লাগছে।', short: 'ভয় লাগছে।', neg: 'আমার ভয় লাগছে না।' },
  { id: 'tired', kind: 'feeling', forms: ['ক্লান্ত', 'ক্লান্তি'], plain: 'আমি ক্লান্ত।', strong: 'আমি খুব ক্লান্ত।', short: 'ক্লান্ত লাগছে।', neg: 'আমি ক্লান্ত না।' },
  { id: 'bored', kind: 'feeling', forms: ['বিরক্ত', 'বিরক্তি'], plain: 'আমার বিরক্ত লাগছে।', strong: 'আমার খুব বিরক্ত লাগছে।', short: 'বিরক্ত লাগছে।', neg: 'আমার বিরক্ত লাগছে না।' },
  { id: 'hungry', kind: 'feeling', forms: ['খিদে', 'ক্ষুধা', 'খিদা'], plain: 'আমার {w} পেয়েছে।', strong: 'আমার খুব {w} পেয়েছে।', short: '{w} পেয়েছে।', neg: 'আমার {w} পায়নি।' },
  { id: 'thirsty', kind: 'feeling', forms: ['পিপাসা', 'তেষ্টা'], plain: 'আমার {w} পেয়েছে।', strong: 'আমার খুব {w} পেয়েছে।', short: '{w} পেয়েছে।', neg: 'আমার {w} পায়নি।' },
  { id: 'hot', kind: 'feeling', forms: ['গরম'], plain: 'আমার গরম লাগছে।', strong: 'আমার খুব গরম লাগছে।', short: 'গরম লাগছে।', neg: 'আমার গরম লাগছে না।' },
  { id: 'cold', kind: 'feeling', forms: ['ঠান্ডা', 'শীত'], plain: 'আমার {w} লাগছে।', strong: 'আমার খুব {w} লাগছে।', short: '{w} লাগছে।', neg: 'আমার {w} লাগছে না।' },
  { id: 'lonely', kind: 'feeling', forms: ['একা'], plain: 'আমার একা লাগছে।', strong: 'আমার খুব একা লাগছে।', short: 'একা লাগছে।', neg: 'আমার একা লাগছে না।' },
  { id: 'good', kind: 'feeling', forms: ['ভালো', 'ভাল'], plain: 'আমার {w} লাগছে।', strong: 'আমার খুব {w} লাগছে।', short: '{w} লাগছে।', neg: 'আমার {w} লাগছে না।' },
  { id: 'worried', kind: 'feeling', forms: ['চিন্তা', 'দুশ্চিন্তা'], plain: 'আমার {w} হচ্ছে।', strong: 'আমার খুব {w} হচ্ছে।', short: '{w} হচ্ছে।', neg: 'আমার {w} হচ্ছে না।' },
  { id: 'sleepy', kind: 'feeling', forms: ['ঘুম পাচ্ছে', 'ঘুম ঘুম'], plain: 'আমার ঘুম পাচ্ছে।', strong: 'আমার খুব ঘুম পাচ্ছে।', short: 'ঘুম পাচ্ছে।', neg: 'আমার ঘুম পাচ্ছে না।' },

  // ---- Health (symptoms & body parts) --------------------------------------
  {
    id: 'pain',
    kind: 'symptom',
    forms: ['ব্যথা', 'ব্যাথা'],
    plain: 'আমার ব্যথা করছে।',
    strong: 'আমার খুব ব্যথা করছে।',
    short: 'ব্যথা করছে।',
    neg: 'আমার ব্যথা করছে না।',
    body: { plain: 'আমার {b} ব্যথা করছে।', strong: 'আমার {b} খুব ব্যথা করছে।', short: '{base} ব্যথা।' },
  },
  { id: 'headache', kind: 'symptom', forms: ['মাথা ব্যথা', 'মাথাব্যথা', 'মাথা ব্যাথা'], plain: 'আমার মাথা ব্যথা করছে।', strong: 'আমার মাথা খুব ব্যথা করছে।', short: 'মাথা ব্যথা।', neg: 'আমার মাথা ব্যথা করছে না।' },
  { id: 'stomachache', kind: 'symptom', forms: ['পেট ব্যথা', 'পেটব্যথা', 'পেট ব্যাথা'], plain: 'আমার পেটে ব্যথা করছে।', strong: 'আমার পেটে খুব ব্যথা করছে।', short: 'পেট ব্যথা।', neg: 'আমার পেটে ব্যথা করছে না।' },
  { id: 'toothache', kind: 'symptom', forms: ['দাঁত ব্যথা', 'দাঁতে ব্যথা'], plain: 'আমার দাঁতে ব্যথা করছে।', strong: 'আমার দাঁতে খুব ব্যথা করছে।', short: 'দাঁত ব্যথা।', neg: 'আমার দাঁতে ব্যথা করছে না।' },
  { id: 'fever', kind: 'symptom', forms: ['জ্বর', 'জ্বর জ্বর'], plain: 'আমার জ্বর জ্বর লাগছে।', strong: 'আমার মনে হচ্ছে অনেক জ্বর এসেছে।', short: 'জ্বর লাগছে।', neg: 'আমার জ্বর লাগছে না।' },
  { id: 'cough', kind: 'symptom', forms: ['কাশি'], plain: 'আমার কাশি হচ্ছে।', strong: 'আমার খুব কাশি হচ্ছে।', short: 'কাশি হচ্ছে।', neg: 'আমার কাশি হচ্ছে না।' },
  { id: 'dizzy', kind: 'symptom', forms: ['মাথা ঘোরা', 'মাথা ঘুরছে'], plain: 'আমার মাথা ঘুরছে।', strong: 'আমার খুব মাথা ঘুরছে।', short: 'মাথা ঘুরছে।', neg: 'আমার মাথা ঘুরছে না।' },
  { id: 'nausea', kind: 'symptom', forms: ['বমি ভাব', 'বমি', 'বমি বমি'], plain: 'আমার বমি বমি লাগছে।', strong: 'আমার খুব বমি বমি লাগছে।', short: 'বমি লাগছে।', neg: 'আমার বমি বমি লাগছে না।' },
  { id: 'breath', kind: 'symptom', forms: ['শ্বাসকষ্ট', 'শ্বাস কষ্ট', 'নিঃশ্বাস'], plain: 'আমার শ্বাস নিতে কষ্ট হচ্ছে।', strong: 'আমার শ্বাস নিতে খুব কষ্ট হচ্ছে।', short: 'শ্বাসকষ্ট হচ্ছে।', neg: 'আমার শ্বাস নিতে কষ্ট হচ্ছে না।' },
  { id: 'unwell', kind: 'symptom', forms: ['শরীর খারাপ', 'অসুস্থ', 'অসুখ'], plain: 'আমার শরীর ভালো লাগছে না।', strong: 'আমার শরীর একদম ভালো লাগছে না।', short: 'শরীর খারাপ।', neg: 'আমার শরীর খারাপ লাগছে না।' },
  {
    id: 'itch',
    kind: 'symptom',
    forms: ['চুলকানি', 'চুলকাচ্ছে'],
    plain: 'আমার চুলকাচ্ছে।',
    strong: 'আমার খুব চুলকাচ্ছে।',
    short: 'চুলকাচ্ছে।',
    neg: 'আমার চুলকাচ্ছে না।',
    body: { plain: 'আমার {b} চুলকাচ্ছে।', strong: 'আমার {b} খুব চুলকাচ্ছে।', short: '{base} চুলকাচ্ছে।' },
  },
  { id: 'head', kind: 'body', forms: ['মাথা'] },
  { id: 'hand', kind: 'body', forms: ['হাত'] },
  { id: 'leg', kind: 'body', forms: ['পা'], locBy: { পা: 'পায়ে' } },
  { id: 'back', kind: 'body', forms: ['পিঠ', 'কোমর'] },
  { id: 'ear', kind: 'body', forms: ['কান'] },
  { id: 'eye', kind: 'body', forms: ['চোখ'] },
  { id: 'throat', kind: 'body', forms: ['গলা'] },
  { id: 'chest', kind: 'body', forms: ['বুক'] },
  { id: 'stomach', kind: 'body', forms: ['পেট'] },
  { id: 'tooth', kind: 'body', forms: ['দাঁত'] },
  { id: 'knee', kind: 'body', forms: ['হাঁটু'] },

  // ---- Activities (things I want to do) ------------------------------------
  { id: 'eat', kind: 'activity', verb: 'eat', forms: ['খাওয়া', 'খাব', 'খাই', 'খেতে', 'খেতে চাই'] },
  { id: 'go', kind: 'activity', verb: 'go', forms: ['যাওয়া', 'যাব', 'যাই', 'যেতে', 'যেতে চাই'] },
  { id: 'sleep', kind: 'activity', verb: 'sleep', forms: ['ঘুমানো', 'ঘুম', 'ঘুমাব', 'ঘুমাতে', 'ঘুমাতে চাই'] },
  { id: 'rest', kind: 'activity', verb: 'rest', forms: ['বিশ্রাম', 'বিশ্রাম নেব', 'বিশ্রাম নিতে চাই'] },
  { id: 'play', kind: 'activity', verb: 'play', forms: ['খেলা', 'খেলব', 'খেলতে', 'খেলতে চাই'] },
  { id: 'watch', kind: 'activity', verb: 'watch', forms: ['দেখা', 'দেখব', 'দেখতে', 'দেখতে চাই'] },
  { id: 'listen', kind: 'activity', verb: 'listen', forms: ['শোনা', 'শুনব', 'শুনতে', 'শুনতে চাই'] },
  { id: 'read', kind: 'activity', verb: 'read', forms: ['পড়া', 'পড়ব', 'পড়তে', 'পড়তে চাই'] },
  { id: 'talk', kind: 'activity', verb: 'talk', forms: ['কথা বলা', 'কথা বলব', 'কথা বলতে চাই', 'কথা'] },
  { id: 'sit', kind: 'activity', verb: 'sit', forms: ['বসা', 'বসব', 'বসতে', 'বসতে চাই'] },
  { id: 'bathe', kind: 'activity', verb: 'bathe', forms: ['গোসল', 'গোসল করব', 'গোসল করতে চাই'] },
  { id: 'turn_over', kind: 'activity', verb: 'turn', forms: ['পাশ ফেরা', 'পাশ ফিরব', 'পাশ ফিরতে চাই'] },
  { id: 'answer', kind: 'activity', verb: 'answer', forms: ['উত্তর', 'উত্তর দেব', 'উত্তর দিতে চাই'] },

  // ---- Acts directed at the listener ---------------------------------------
  { id: 'help', kind: 'act', act: 'help', forms: ['সাহায্য', 'সাহায্য করো', 'সাহায্য করুন', 'হেল্প'] },
  { id: 'give', kind: 'act', act: 'give', forms: ['দেওয়া', 'দাও', 'দিন', 'দেন'] },
  { id: 'call', kind: 'act', act: 'call', forms: ['ডাকা', 'ডাকো', 'ডাকুন', 'ডেকে দাও'] },
  { id: 'take', kind: 'act', act: 'take', forms: ['নিয়ে যাও', 'নিয়ে যান', 'নিয়ে চলো'] },
  { id: 'wait', kind: 'act', act: 'wait', forms: ['অপেক্ষা', 'অপেক্ষা করো', 'দাঁড়াও'] },
  { id: 'stop', kind: 'act', act: 'stop', forms: ['থামো', 'থামুন', 'থাম', 'বন্ধ করো'] },
  { id: 'come', kind: 'act', act: 'come', forms: ['আসা', 'আসো', 'এসো', 'আসুন'] },
  { id: 'repeat', kind: 'act', act: 'repeat', forms: ['আবার বলো', 'আবার বলুন', 'আরেকবার'] },

  // ---- Desire markers ------------------------------------------------------
  { id: 'want', kind: 'desire', need: false, forms: ['চাই', 'ইচ্ছা'] },
  { id: 'need', kind: 'desire', need: true, forms: ['দরকার', 'লাগবে'] },

  // ---- Phrases -------------------------------------------------------------
  { id: 'yes', kind: 'phrase', forms: ['হ্যাঁ', 'হা', 'জি', 'জ্বি'], tumi: 'হ্যাঁ।', apni: 'জি, হ্যাঁ।', shortT: 'হ্যাঁ।', shortA: 'জি।', position: 'start' },
  { id: 'no', kind: 'phrase', forms: ['না'], tumi: 'না।', apni: 'জি, না।', shortT: 'না।', shortA: 'না।', negator: true, position: 'start' },
  {
    id: 'thanks',
    kind: 'phrase',
    forms: ['ধন্যবাদ', 'থ্যাংক ইউ'],
    tumi: 'তোমাকে ধন্যবাদ।',
    apni: 'আপনাকে ধন্যবাদ।',
    shortT: 'ধন্যবাদ।',
    shortA: 'ধন্যবাদ।',
    warmT: 'তোমাকে অনেক ধন্যবাদ!',
    warmA: 'আপনাকে অনেক ধন্যবাদ!',
    position: 'end',
  },
  { id: 'sorry', kind: 'phrase', forms: ['দুঃখিত', 'সরি'], tumi: 'আমি দুঃখিত।', apni: 'আমি দুঃখিত।', shortT: 'দুঃখিত।', shortA: 'দুঃখিত।', warmT: 'আমি সত্যিই দুঃখিত।', warmA: 'আমি সত্যিই দুঃখিত।', position: 'start' },
  { id: 'please', kind: 'phrase', forms: ['দয়া করে', 'প্লিজ'], tumi: 'প্লিজ।', apni: 'দয়া করে।', please: true, position: 'start' },
  { id: 'hello', kind: 'phrase', forms: ['হ্যালো', 'হাই'], tumi: 'হ্যালো!', apni: 'হ্যালো!', position: 'start' },
  { id: 'salam', kind: 'phrase', forms: ['সালাম', 'আসসালামু আলাইকুম'], tumi: 'আসসালামু আলাইকুম।', apni: 'আসসালামু আলাইকুম।', position: 'start' },
  { id: 'nomoskar', kind: 'phrase', forms: ['নমস্কার'], tumi: 'নমস্কার।', apni: 'নমস্কার।', position: 'start' },
  { id: 'how_are_you', kind: 'phrase', forms: ['কেমন আছেন', 'কেমন আছ', 'কেমন আছো'], tumi: 'তুমি কেমন আছ?', apni: 'আপনি কেমন আছেন?', shortT: 'কেমন আছ?', shortA: 'কেমন আছেন?', position: 'start' },
  { id: 'i_am_fine', kind: 'phrase', forms: ['ভালো আছি', 'ঠিক আছি'], tumi: 'আমি ভালো আছি।', apni: 'আমি ভালো আছি।', shortT: 'ভালো আছি।', shortA: 'ভালো আছি।', position: 'start' },
  { id: 'okay', kind: 'phrase', forms: ['ঠিক আছে', 'আচ্ছা', 'ওকে'], tumi: 'ঠিক আছে।', apni: 'ঠিক আছে।', position: 'start' },
  { id: 'dont_know', kind: 'phrase', forms: ['জানি না'], tumi: 'আমি জানি না।', apni: 'আমি জানি না।', shortT: 'জানি না।', shortA: 'জানি না।', position: 'start' },
  {
    id: 'not_understand',
    kind: 'phrase',
    forms: ['বুঝিনি', 'বুঝি নাই', 'বুঝতে পারিনি', 'বুঝলাম না'],
    tumi: 'আমি বুঝতে পারিনি।',
    apni: 'আমি বুঝতে পারিনি।',
    shortT: 'বুঝিনি।',
    shortA: 'বুঝিনি।',
    reqT: 'আমি বুঝতে পারিনি, আরেকবার বলবে?',
    reqA: 'আমি বুঝতে পারিনি, আরেকবার বলবেন?',
    position: 'start',
  },
  { id: 'finished', kind: 'phrase', forms: ['শেষ', 'হয়ে গেছে'], tumi: 'আমার শেষ হয়েছে।', apni: 'আমার শেষ হয়েছে।', shortT: 'শেষ।', shortA: 'শেষ।', position: 'end' },
  { id: 'bye', kind: 'phrase', forms: ['বিদায়', 'বাই'], tumi: 'আবার দেখা হবে।', apni: 'আবার দেখা হবে।', shortT: 'বিদায়।', shortA: 'বিদায়।', position: 'end' },
  { id: 'love', kind: 'phrase', forms: ['ভালোবাসা', 'ভালোবাসি'], tumi: 'আমি তোমাকে ভালোবাসি।', apni: 'আমি আপনাকে ভালোবাসি।', shortT: 'ভালোবাসি।', shortA: 'ভালোবাসি।', intimate: true, position: 'end' },

  // ---- Emergency -----------------------------------------------------------
  {
    id: 'urgent_help',
    kind: 'urgent',
    forms: ['জরুরি সাহায্য', 'জরুরি', 'বাঁচাও'],
    direct: 'আমার এখনই সাহায্য লাগবে!',
    reqT: 'এখনই আমাকে সাহায্য করো!',
    reqA: 'দয়া করে এখনই আমাকে সাহায্য করুন!',
    short: 'জরুরি সাহায্য!',
  },
  {
    id: 'danger',
    kind: 'urgent',
    forms: ['বিপদ'],
    direct: 'বিপদ হয়েছে!',
    reqT: 'বিপদ! তাড়াতাড়ি এসো!',
    reqA: 'বিপদ! দয়া করে তাড়াতাড়ি আসুন!',
    short: 'বিপদ!',
  },
  {
    id: 'fell',
    kind: 'urgent',
    forms: ['পড়ে গেছি'],
    direct: 'আমি পড়ে গেছি!',
    reqT: 'আমি পড়ে গেছি, আমাকে সাহায্য করো!',
    reqA: 'আমি পড়ে গেছি, দয়া করে আমাকে সাহায্য করুন!',
    short: 'পড়ে গেছি!',
  },

  // ---- Modifiers & grammatical hints ---------------------------------------
  { id: 'intensity', kind: 'mod', mod: 'intensity', forms: ['খুব', 'অনেক', 'বেশি'] },
  { id: 'softener', kind: 'mod', mod: 'softener', forms: ['একটু', 'একটুখানি'] },
  { id: 'now', kind: 'mod', mod: 'now', forms: ['এখন', 'এখনই', 'তাড়াতাড়ি'] },
  { id: 'later', kind: 'mod', mod: 'later', forms: ['পরে'] },
  { id: 'more', kind: 'mod', mod: 'more', forms: ['আরো', 'আরও', 'আরেকটু'] },
  { id: 'self', kind: 'mod', mod: 'self', forms: ['আমি', 'আমার', 'আমাকে'] },
  { id: 'pron_tumi', kind: 'pronoun', pronoun: 'tumi', forms: ['তুমি', 'তোমাকে', 'তোমার'] },
  { id: 'pron_apni', kind: 'pronoun', pronoun: 'apni', forms: ['আপনি', 'আপনাকে', 'আপনার'] },
  { id: 'pron_tui', kind: 'pronoun', pronoun: 'tui', forms: ['তুই', 'তোকে', 'তোর'] },
  { id: 'honorific', kind: 'honorific', forms: ['স্যার', 'ম্যাডাম', 'ম্যাম', 'মিস'] },
];

export const LEXEME_BY_ID: Record<string, Lexeme> = Object.fromEntries(LEXICON.map((l) => [l.id, l]));

/** Normalised surface form → lexeme, plus the longest form length in words. */
export const FORM_INDEX: Map<string, Lexeme> = new Map();
export let MAX_FORM_WORDS = 1;
for (const lex of LEXICON) {
  for (const form of lex.forms) {
    const key = form.normalize('NFC');
    if (!FORM_INDEX.has(key)) FORM_INDEX.set(key, lex);
    MAX_FORM_WORDS = Math.max(MAX_FORM_WORDS, key.split(' ').length);
  }
}
