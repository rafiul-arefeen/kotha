import { NEUTRAL_STARTER_PHRASES, STARTER_PHRASES } from '@/data/starterPhrases';
import type { HistoryEntry, RegisterId } from '@/types';

export interface SuggestedPhrase {
  text: string;
  en?: string;
  fromHistory: boolean;
}

/**
 * "এখন হয়তো লাগবে" suggestions: the user's own favourite / frequent phrases
 * for the current listener first, then starter phrases for that listener.
 */
export function suggestPhrases(entries: HistoryEntry[], register: RegisterId | null, limit = 6): SuggestedPhrase[] {
  const own = entries
    .filter((e) => e.register === register)
    .sort(
      (a, b) =>
        Number(b.favorite) - Number(a.favorite) || b.useCount - a.useCount || b.lastUsedAt - a.lastUsedAt,
    )
    .slice(0, limit)
    .map((e) => ({ text: e.text, fromHistory: true }));

  const starters = (register ? STARTER_PHRASES[register] : NEUTRAL_STARTER_PHRASES)
    .filter((s) => !own.some((o) => o.text === s.text))
    .map((s) => ({ text: s.text, en: s.en, fromHistory: false }));

  return [...own, ...starters].slice(0, limit);
}
