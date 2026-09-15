/** Small helpers for working with Bangla text. */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/**
 * Normalise Bangla text for matching. NFC matters: য়/ড়/ঢ় can be typed either
 * as a single code point or as base + nukta depending on the keyboard.
 */
export function normalizeBangla(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[‌‍]/g, '')
    .replace(/[।,.!?;:"'()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split a typed keyword string into individual words. */
export function splitWords(text: string): string[] {
  const n = normalizeBangla(text);
  return n ? n.split(' ') : [];
}

const VOWEL_SIGNS = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ']);
const INDEPENDENT_VOWELS = new Set(['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ']);

function lastChar(word: string): string {
  const chars = Array.from(word.normalize('NFC'));
  return chars[chars.length - 1] ?? '';
}

function endsWithVowel(word: string): boolean {
  const c = lastChar(word);
  return VOWEL_SIGNS.has(c) || INDEPENDENT_VOWELS.has(c);
}

/**
 * Heuristic case forms for words the lexicon does not know (e.g. symbols an
 * educator added). Good enough for common nouns; the UI always lets the user
 * edit the resulting sentence.
 */
export function objectiveForm(word: string): string {
  return `${word}কে`;
}

export function genitiveForm(word: string): string {
  return endsWithVowel(word) ? `${word}র` : `${word}ের`;
}

export function locativeForm(word: string): string {
  const c = lastChar(word);
  if (c === 'া') return `${word}য়`;
  if (endsWithVowel(word)) return `${word}তে`;
  return `${word}ে`;
}

/** Ensure a sentence ends with Bangla sentence punctuation. */
export function ensureDari(sentence: string): string {
  const t = sentence.trim();
  if (!t) return t;
  return /[।?!]$/.test(t) ? t : `${t}।`;
}

export function relativeTimeBn(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'এইমাত্র';
  if (min < 60) return `${toBanglaDigits(min)} মিনিট আগে`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${toBanglaDigits(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'গতকাল';
  if (days < 30) return `${toBanglaDigits(days)} দিন আগে`;
  return new Date(timestamp).toLocaleDateString('bn-BD');
}
