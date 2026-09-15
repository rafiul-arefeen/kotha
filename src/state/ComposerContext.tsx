import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

import { generateSentence, LLMError } from '@/services/llm';
import { isRelabelled } from '@/storage/vocabulary';
import type {
  ComposerItem,
  GenerationResult,
  GenerationStyle,
  MessageOrigin,
  RegisterId,
  RequestItem,
  SentenceOption,
  SymbolItem,
} from '@/types';
import { makeId } from '@/utils/id';

import { usePreferences } from './PreferencesContext';
import { useVocabulary } from './VocabularyContext';

export interface OutgoingMessage {
  text: string;
  origin: MessageOrigin;
  register: RegisterId | null;
  inputs: string[];
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'done' | 'error';
  result: GenerationResult | null;
  error: string | null;
  style: GenerationStyle;
  variant: number;
  /** Input signature the result belongs to; used to detect stale results. */
  inputKey: string;
}

const IDLE: GenerationState = { status: 'idle', result: null, error: null, style: 'auto', variant: 0, inputKey: '' };

interface ComposerValue {
  items: ComposerItem[];
  inputLabels: string[];
  inputKey: string;
  addSymbol: (symbol: SymbolItem) => void;
  /** Adds typed text; commas separate multiple keywords. Returns count added. */
  addKeywords: (text: string) => number;
  removeItem: (key: string) => void;
  undo: () => void;
  clearItems: () => void;

  generation: GenerationState;
  draft: string;
  edited: boolean;
  setDraft: (text: string) => void;
  generate: (options?: { style?: GenerationStyle; nextVariant?: boolean }) => Promise<void>;
  chooseAlternative: (option: SentenceOption) => void;
  resetGeneration: () => void;
  /** Edit a finished message by hand (no automatic regeneration). */
  startManualEdit: (text: string) => void;

  message: OutgoingMessage | null;
  setMessage: (message: OutgoingMessage | null) => void;
  /** Start a new message: clears selection, sentence and output. */
  finish: () => void;
}

const ComposerContext = createContext<ComposerValue | null>(null);

function labelOf(item: ComposerItem): string {
  return item.type === 'symbol' ? item.label : item.text;
}

export function ComposerProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  const { symbolById, recordUsage } = useVocabulary();
  const [items, setItems] = useState<ComposerItem[]>([]);
  const [generation, setGeneration] = useState<GenerationState>(IDLE);
  const [draft, setDraftState] = useState('');
  const [edited, setEdited] = useState(false);
  const [message, setMessage] = useState<OutgoingMessage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const inputKey = `${preferences.register ?? '-'}|${items.map((i) => i.key).join(',')}`;

  const toRequestItems = (list: ComposerItem[]): RequestItem[] =>
    list.map((item) => {
      if (item.type === 'keyword') return { source: 'keyword', text: item.text };
      const symbol = symbolById[item.symbolId];
      return {
        source: 'symbol',
        text: item.label,
        symbolId: item.symbolId,
        category: item.category,
        keywords: symbol?.keywords,
        custom: !!symbol?.custom || (symbol ? isRelabelled(symbol) : false),
      };
    });

  const generate = async (options: { style?: GenerationStyle; nextVariant?: boolean } = {}) => {
    const register = preferences.register;
    if (!register || items.length === 0) return;
    const style = options.style ?? 'auto';
    const variant = options.nextVariant ? generation.variant + 1 : 0;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const key = inputKey;
    setGeneration((g) => ({ ...g, status: 'loading', error: null, style, variant, inputKey: key }));

    try {
      const result = await generateSentence(
        { items: toRequestItems(items), register, style, variant },
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setGeneration({ status: 'done', result, error: null, style, variant, inputKey: key });
      setDraftState(result.sentence);
      setEdited(false);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.warn('[composer] generation failed', error);
      const text =
        error instanceof LLMError && error.code === 'empty_input'
          ? 'বাক্য বানানোর মতো শব্দ পাওয়া যায়নি। প্রতীক বেছে নিন বা শব্দ লিখুন।'
          : 'বাক্য তৈরি করা যায়নি। আবার চেষ্টা করুন, অথবা নিজে লিখুন।';
      setGeneration((g) => ({ ...g, status: 'error', error: text }));
    }
  };

  const chooseAlternative = (option: SentenceOption) =>
    setGeneration((g) => {
      if (!g.result) return g;
      const previous: SentenceOption = { text: g.result.sentence, style: g.result.style };
      setDraftState(option.text);
      setEdited(false);
      return {
        ...g,
        result: {
          ...g.result,
          sentence: option.text,
          style: option.style,
          alternatives: [previous, ...g.result.alternatives.filter((a) => a.text !== option.text)],
        },
      };
    });

  const resetGeneration = () => {
    abortRef.current?.abort();
    setGeneration(IDLE);
    setDraftState('');
    setEdited(false);
  };

  return (
    <ComposerContext
      value={{
        items,
        inputLabels: items.map(labelOf),
        inputKey,
        addSymbol: (symbol) => {
          recordUsage(symbol.id);
          setItems((prev) => [
            ...prev,
            {
              key: makeId('item'),
              type: 'symbol',
              symbolId: symbol.id,
              label: symbol.label,
              icon: symbol.icon,
              category: symbol.category,
            },
          ]);
        },
        addKeywords: (text) => {
          const parts = text
            .split(/[,،;\n]+/)
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length) {
            setItems((prev) => [...prev, ...parts.map((p) => ({ key: makeId('item'), type: 'keyword' as const, text: p }))]);
          }
          return parts.length;
        },
        removeItem: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
        undo: () => setItems((prev) => prev.slice(0, -1)),
        clearItems: () => setItems([]),

        generation,
        draft,
        edited,
        setDraft: (text) => {
          setDraftState(text);
          setEdited(text.trim() !== (generation.result?.sentence ?? '').trim());
        },
        generate,
        chooseAlternative,
        resetGeneration,
        startManualEdit: (text) => {
          abortRef.current?.abort();
          setGeneration({ ...IDLE, inputKey });
          setDraftState(text);
          setEdited(true);
        },

        message,
        setMessage,
        finish: () => {
          abortRef.current?.abort();
          setItems([]);
          setGeneration(IDLE);
          setDraftState('');
          setEdited(false);
          setMessage(null);
        },
      }}>
      {children}
    </ComposerContext>
  );
}

export function useComposer(): ComposerValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error('useComposer must be used inside ComposerProvider');
  return ctx;
}
