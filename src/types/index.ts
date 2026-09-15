/**
 * Shared domain types for Kotha.
 * Keep these free of React / React Native imports so services and data files
 * can be reused by a backend or tests.
 */

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export type CategoryId =
  | 'needs'
  | 'people'
  | 'actions'
  | 'feelings'
  | 'places'
  | 'food'
  | 'health'
  | 'phrases'
  | 'emergency';

/** Filter chips on the home screen include two virtual categories. */
export type CategoryFilterId = CategoryId | 'all' | 'frequent';

export interface Category {
  id: CategoryId;
  label: string; // Bangla
  en: string;
  icon: string;
}

export interface SymbolItem {
  id: string;
  /** Bangla label shown on the tile and used in generation. */
  label: string;
  /** Short English gloss (secondary label, for carers / researchers). */
  en: string;
  category: CategoryId;
  /** Emoji or short glyph. Placeholder until licensed symbol art is added. */
  icon: string;
  /** Extra Bangla words that should match this symbol when typed. */
  keywords?: string[];
  enabled: boolean;
  /** True for symbols added by an educator/SLP in the Vocabulary screen. */
  custom?: boolean;
}

// ---------------------------------------------------------------------------
// Register (addressee / politeness)
// ---------------------------------------------------------------------------

export type RegisterId = 'family' | 'friend' | 'teacher' | 'doctor' | 'stranger' | 'caregiver';

/** Bangla second-person pronoun level. তুই is deliberately not generated. */
export type Pronoun = 'tumi' | 'apni';

export interface Register {
  id: RegisterId;
  label: string;
  en: string;
  icon: string;
  pronoun: Pronoun;
  /**
   * Whether the pronoun choice for this addressee is conventional.
   * `false` means Bangla speakers commonly use either তুমি or আপনি, so the
   * generator must flag it instead of deciding silently.
   */
  pronounCertain: boolean;
  description: string;
}

// ---------------------------------------------------------------------------
// Composer (what the user has selected / typed)
// ---------------------------------------------------------------------------

export type ComposerItem =
  | { key: string; type: 'symbol'; symbolId: string; label: string; icon: string; category: CategoryId }
  | { key: string; type: 'keyword'; text: string };

// ---------------------------------------------------------------------------
// Sentence generation (LLM abstraction)
// ---------------------------------------------------------------------------

/** How the user asked the sentence to be adjusted. */
export type GenerationStyle = 'auto' | 'shorter' | 'politer' | 'simpler';

/**
 * direct     – plain statement / instruction      (আমি একটু পানি চাই।)
 * request    – polite request or question         (আমাকে কি একটু পানি দিতে পারবেন?)
 * permission – asking permission                  (আমি কি একটু পানি খেতে পারি?)
 * short      – telegraphic                        (পানি চাই।)
 * warm       – more emphatic / emotional          (আমার খুব ভয় লাগছে।)
 * other      – a different plausible meaning of an ambiguous input
 */
export type SentenceStyle = 'direct' | 'request' | 'permission' | 'short' | 'warm' | 'other';

export interface RequestItem {
  source: 'symbol' | 'keyword';
  /** Bangla text as shown to the user (symbol label or typed keyword). */
  text: string;
  symbolId?: string;
  category?: CategoryId;
  keywords?: string[];
  /** True when the symbol was added or relabelled by an educator. */
  custom?: boolean;
}

export interface GenerationRequest {
  items: RequestItem[];
  register: RegisterId;
  style: GenerationStyle;
  /** Increment to ask for a different phrasing ("regenerate"). */
  variant: number;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type WarningCode =
  | 'register_uncertain'
  | 'register_conflict'
  | 'unknown_words'
  | 'meaning_uncertain'
  | 'medical_boundary'
  | 'offline_fallback';

export interface GenerationWarning {
  code: WarningCode;
  /** Optional detail, e.g. the words that were not recognised. */
  words?: string[];
}

export interface SentenceOption {
  text: string;
  style: SentenceStyle;
}

export interface GenerationResult {
  sentence: string;
  style: SentenceStyle;
  alternatives: SentenceOption[];
  registerConfidence: ConfidenceLevel;
  vocabularyConfidence: ConfidenceLevel;
  warnings: GenerationWarning[];
  register: RegisterId;
  source: 'mock' | 'remote' | 'cache';
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export type DwellMs = 0 | 1000 | 1500 | 2000;
export type GridSize = 'large' | 'medium' | 'small';
export type TextScale = 1 | 1.15 | 1.3;

export interface Preferences {
  onboarded: boolean;
  /** `null` until the user has explicitly chosen who they talk to. */
  register: RegisterId | null;
  dwellMs: DwellMs;
  ttsEnabled: boolean;
  speechRate: number;
  textScale: TextScale;
  gridSize: GridSize;
  highContrast: boolean;
  showEnglish: boolean;
}

export type MessageOrigin = 'ai' | 'edited' | 'own-words' | 'history';

export interface HistoryEntry {
  id: string;
  text: string;
  register: RegisterId | null;
  origin: MessageOrigin;
  /** Labels of the symbols/keywords that produced the message (for context). */
  inputs: string[];
  createdAt: number;
  lastUsedAt: number;
  useCount: number;
  favorite: boolean;
}

/** Edits an educator made to a built-in symbol. */
export interface SymbolOverride {
  label?: string;
  en?: string;
  icon?: string;
  keywords?: string[];
  enabled?: boolean;
}

export interface VocabularyState {
  overrides: Record<string, SymbolOverride>;
  custom: SymbolItem[];
}
