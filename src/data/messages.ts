/** User-facing Bangla copy for generation results. */
import type { GenerationResult, GenerationWarning, RegisterId, SentenceStyle } from '@/types';

import { PRONOUN_LABEL, REGISTER_BY_ID } from './registers';

export const STYLE_LABELS: Record<SentenceStyle, { bn: string; en: string }> = {
  direct: { bn: 'সরাসরি', en: 'DIRECT' },
  request: { bn: 'অনুরোধ', en: 'REQUEST' },
  permission: { bn: 'অনুমতি চাওয়া', en: 'ASKING PERMISSION' },
  short: { bn: 'সংক্ষিপ্ত', en: 'SHORT' },
  warm: { bn: 'জোর দিয়ে', en: 'EMPHATIC' },
  other: { bn: 'অন্যভাবে', en: 'ANOTHER WAY' },
};

export const SOURCE_LABELS: Record<GenerationResult['source'], string> = {
  mock: '✨ নমুনা AI',
  remote: '✨ AI',
  cache: '📦 আগে তৈরি',
};

export interface WarningText {
  tone: 'warn' | 'info';
  icon: string;
  title: string;
  detail?: string;
}

/** Friendly wording for confidence warnings — no raw probabilities. */
export function describeWarning(warning: GenerationWarning, registerId: RegisterId): WarningText {
  const register = REGISTER_BY_ID[registerId];
  const pronoun = PRONOUN_LABEL[register.pronoun];
  const words = warning.words?.length ? warning.words.join(', ') : '';

  switch (warning.code) {
    case 'register_uncertain':
      return {
        tone: 'warn',
        icon: '⚠️',
        title: 'ভাষার ধরনটি যাচাই করে নিন।',
        detail: `${register.label}-কে কেউ "তুমি", কেউ "আপনি" বলেন। এখানে "${pronoun}" ব্যবহার করা হয়েছে।`,
      };
    case 'register_conflict':
      return {
        tone: 'warn',
        icon: '⚠️',
        title: 'ভাষার ধরনটি যাচাই করে নিন।',
        detail: words
          ? `লেখা শব্দ (${words}) আর বেছে নেওয়া মানুষ (${register.label} · "${pronoun}") মিলছে না।`
          : `এই কথাটি ${register.label}-কে বলা স্বাভাবিক কিনা দেখে নিন।`,
      };
    case 'unknown_words':
      return {
        tone: 'warn',
        icon: '🔍',
        title: 'কিছু শব্দ চেনা যায়নি — বাক্যটি ঠিক আছে কিনা দেখে নিন।',
        detail: words ? `চেনা যায়নি: ${words}` : undefined,
      };
    case 'meaning_uncertain':
      return {
        tone: 'warn',
        icon: '🤔',
        title: 'আপনি যা বলতে চেয়েছেন, বাক্যটি তা-ই বলছে কিনা দেখে নিন।',
        detail: 'দরকার হলে নিচের অন্য বিকল্প বেছে নিন বা এডিট করুন।',
      };
    case 'medical_boundary':
      return {
        tone: 'info',
        icon: '🩺',
        title: 'কথা শুধু বলতে সাহায্য করে — রোগ বা ওষুধের সিদ্ধান্ত ডাক্তার নেবেন।',
      };
    case 'offline_fallback':
      return {
        tone: 'info',
        icon: '📴',
        title: 'সার্ভারে যোগাযোগ করা যায়নি — অফলাইনে তৈরি বাক্য দেখানো হচ্ছে।',
      };
  }
}
