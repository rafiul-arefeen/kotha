/**
 * Rule-based Bangla sentence composer used by MockLLMService.
 *
 * Pipeline:
 *   1. tokenize   – symbols and typed keywords → lexemes (longest match)
 *   2. clauses    – group lexemes into clauses (want water, go outside, pain…)
 *   3. render     – fill register-aware templates for each clause
 *   4. assemble   – combine clauses into ranked sentence options
 *   5. assess     – register / vocabulary confidence and warnings
 *
 * It never invents content: every clause comes from something the user
 * selected or typed. Politeness particles (একটু, দয়া করে) are the only
 * additions.
 */
import { REGISTER_BY_ID } from '@/data/registers';
import type {
  CategoryId,
  ConfidenceLevel,
  GenerationRequest,
  GenerationResult,
  GenerationWarning,
  RequestItem,
  SentenceOption,
  SentenceStyle,
} from '@/types';
import { ensureDari, genitiveForm, locativeForm, splitWords } from '@/utils/bangla';

import { LLMError } from '../LLMService';
import {
  ACTS,
  FORM_INDEX,
  LEXEME_BY_ID,
  MAX_FORM_WORDS,
  VERBS,
  type ActId,
  type ActivityLex,
  type BodyLex,
  type Lexeme,
  type ObjectLex,
  type PersonLex,
  type PlaceLex,
  type VerbForms,
  type VerbId,
} from './lexicon';

// ---------------------------------------------------------------------------
// 1. Tokenize
// ---------------------------------------------------------------------------

interface Token {
  lex: Lexeme;
  /** The word as selected/typed; templates keep the user's wording. */
  surface: string;
  unknown: boolean;
  generic: boolean;
  used: boolean;
}

const SUFFIXES = ['টা', 'টি', 'কে', 'ের', 'তে'];

function genericLexeme(label: string, category: CategoryId | undefined): Lexeme {
  const id = `generic:${label}`;
  switch (category) {
    case 'people':
      return { id, kind: 'person', forms: [label], possessive: true, vocative: true };
    case 'places':
      return { id, kind: 'place', forms: [label] };
    case 'feelings':
      return {
        id,
        kind: 'feeling',
        forms: [label],
        plain: `আমার ${label} লাগছে।`,
        strong: `আমার খুব ${label} লাগছে।`,
        short: `${label}।`,
        neg: `আমার ${label} লাগছে না।`,
      };
    case 'health':
      return {
        id,
        kind: 'symptom',
        forms: [label],
        plain: `আমার ${label} হচ্ছে।`,
        strong: `আমার খুব ${label} হচ্ছে।`,
        short: `${label}।`,
        neg: `আমার ${label} হচ্ছে না।`,
      };
    case 'phrases':
      return { id, kind: 'phrase', forms: [label], tumi: ensureDari(label), apni: ensureDari(label), position: 'start' };
    case 'emergency':
      return {
        id,
        kind: 'urgent',
        forms: [label],
        direct: `${label}!`,
        reqT: `${label}! তাড়াতাড়ি এসো!`,
        reqA: `${label}! দয়া করে তাড়াতাড়ি আসুন!`,
        short: `${label}!`,
      };
    case 'actions':
      return {
        id,
        kind: 'activity',
        forms: [label],
        verb: 'play',
        verbForms: { inf: `${label} করতে`, subj: `${label} করি`, fut: `${label} করব` },
      };
    case 'food':
      return { id, kind: 'object', forms: [label], unit: 'plain', verb: 'eat' };
    case 'needs':
      return { id, kind: 'object', forms: [label], unit: 'thing' };
    default:
      return { id, kind: 'object', forms: [label], unit: 'plain' };
  }
}

function lookup(word: string): { lex: Lexeme; surface: string } | null {
  const direct = FORM_INDEX.get(word);
  if (direct) return { lex: direct, surface: word };
  for (const suffix of SUFFIXES) {
    if (word.length > suffix.length + 1 && word.endsWith(suffix)) {
      const base = word.slice(0, -suffix.length);
      const lex = FORM_INDEX.get(base);
      if (lex && ['object', 'person', 'place', 'transport', 'body'].includes(lex.kind)) {
        return { lex, surface: base };
      }
    }
  }
  return null;
}

function tokenize(items: RequestItem[]): { tokens: Token[]; unknownWords: string[] } {
  const tokens: Token[] = [];
  const unknownWords: string[] = [];

  for (const item of items) {
    if (item.source === 'symbol') {
      const builtIn = item.symbolId && !item.custom ? LEXEME_BY_ID[item.symbolId] : undefined;
      if (builtIn) {
        tokens.push({ lex: builtIn, surface: item.text, unknown: false, generic: false, used: false });
        continue;
      }
      const known = lookup(item.text.normalize('NFC'));
      if (known) {
        tokens.push({ ...known, unknown: false, generic: false, used: false });
      } else {
        tokens.push({ lex: genericLexeme(item.text, item.category), surface: item.text, unknown: false, generic: true, used: false });
      }
      continue;
    }

    const words = splitWords(item.text);
    let i = 0;
    let previousUnknown: Token | null = null;
    while (i < words.length) {
      let matched = false;
      for (let n = Math.min(MAX_FORM_WORDS, words.length - i); n >= 1; n--) {
        const found = lookup(words.slice(i, i + n).join(' '));
        if (found) {
          tokens.push({ ...found, unknown: false, generic: false, used: false });
          i += n;
          matched = true;
          previousUnknown = null;
          break;
        }
      }
      if (!matched) {
        const word = words[i];
        if (previousUnknown) {
          // Keep multi-word unknown phrases together ("স্কুল বাস").
          previousUnknown.surface = `${previousUnknown.surface} ${word}`;
          previousUnknown.lex = genericLexeme(previousUnknown.surface, undefined);
          unknownWords[unknownWords.length - 1] = previousUnknown.surface;
        } else {
          previousUnknown = { lex: genericLexeme(word, undefined), surface: word, unknown: true, generic: true, used: false };
          tokens.push(previousUnknown);
          unknownWords.push(word);
        }
        i += 1;
      }
    }
  }
  return { tokens, unknownWords };
}

// ---------------------------------------------------------------------------
// 2–3. Clauses
// ---------------------------------------------------------------------------

type Forms = Partial<Record<SentenceStyle, string>> & { direct: string };

interface Clause {
  forms: Forms;
  order: SentenceStyle[];
  /** Can take request/permission phrasing (the clause the listener acts on). */
  requestable: boolean;
  rank: number;
}

const RANK = { urgent: 0, phraseStart: 1, symptom: 2, feeling: 3, main: 4, phraseEnd: 6 } as const;
const NEGATABLE: Lexeme['kind'][] = ['object', 'place', 'activity', 'feeling', 'symptom'];
/** Activities that are naturally done *with* someone ("তোমার সাথে খেলতে চাই"). */
const SOCIAL_VERBS: VerbId[] = ['play', 'talk', 'watch', 'read', 'listen', 'eat'];

type OrderKind = 'object' | 'place' | 'activity' | 'act' | 'statement';
type Of<K extends Lexeme['kind']> = Token & { lex: Extract<Lexeme, { kind: K }> };

export function composeSentence(request: GenerationRequest): GenerationResult {
  const register = REGISTER_BY_ID[request.register];
  if (!register) throw new LLMError('bad_response', `Unknown register ${request.register}`);
  const apni = register.pronoun === 'apni';

  const { tokens, unknownWords } = tokenize(request.items);
  const warnings: GenerationWarning[] = [];
  let meaningUncertain = false;

  const unused = <K extends Lexeme['kind']>(kind: K) =>
    tokens.filter((t): t is Of<K> => !t.used && t.lex.kind === kind);
  const take = <K extends Lexeme['kind']>(kind: K, predicate?: (t: Of<K>) => boolean) => {
    const found = unused(kind).find((t) => (predicate ? predicate(t) : true));
    if (found) found.used = true;
    return found;
  };

  // --- modifiers and hints --------------------------------------------------
  let intensity = false;
  let more = false;
  let please = false;
  let addresseeDropped = false;
  let timeAdverb = '';
  let honorific: string | null = null;
  const pronounHints: { pronoun: 'tumi' | 'apni' | 'tui'; word: string }[] = [];

  for (const t of tokens) {
    const lex = t.lex;
    if (lex.kind === 'person' && lex.addressee === register.id) {
      // The symbol names the listener ("শিক্ষক" when talking to a teacher).
      t.used = true;
      addresseeDropped = true;
    } else if (lex.kind === 'mod') {
      t.used = true;
      if (lex.mod === 'intensity') intensity = true;
      if (lex.mod === 'more') more = true;
      if (lex.mod === 'now') timeAdverb = t.surface === 'এখন' ? 'এখন' : 'এখনই';
      if (lex.mod === 'later') timeAdverb = 'পরে';
    } else if (lex.kind === 'pronoun') {
      t.used = true;
      pronounHints.push({ pronoun: lex.pronoun, word: t.surface });
    } else if (lex.kind === 'honorific') {
      t.used = true;
      honorific = t.surface;
    }
  }

  const hasContent = tokens.some(
    (t) => !t.used && !(t.lex.kind === 'phrase' && (t.lex.please || t.lex.negator)) && t.lex.kind !== 'desire',
  );

  // "না" negates the neighbouring content word (the one before it, else after).
  let negTarget: Token | null = null;
  for (let index = 0; index < tokens.length; index++) {
    const t = tokens[index];
    if (t.used || t.lex.kind !== 'phrase') continue;
    if (t.lex.please && hasContent) {
      t.used = true;
      please = true;
    }
    if (t.lex.negator && !negTarget) {
      const isTarget = (o: Token) => !o.used && NEGATABLE.includes(o.lex.kind);
      const target = tokens.slice(0, index).reverse().find(isTarget) ?? tokens.slice(index + 1).find(isTarget);
      if (target) {
        t.used = true;
        negTarget = target;
      }
    }
  }
  const isNegated = (...candidates: (Token | undefined)[]) =>
    negTarget !== null && candidates.some((c) => c === negTarget);

  const desireTok = take('desire');
  const desire: 'want' | 'need' | null = desireTok ? (desireTok.lex.need ? 'need' : 'want') : null;

  // --- helpers --------------------------------------------------------------
  const order = (kind: OrderKind): SentenceStyle[] => {
    if (kind === 'statement') return ['direct', 'warm', 'request', 'other', 'short'];
    if (!apni) {
      return kind === 'act' ? ['direct', 'request', 'other', 'short'] : ['direct', 'request', 'permission', 'other', 'short'];
    }
    if (register.id === 'teacher') {
      return kind === 'act' ? ['request', 'direct', 'other', 'short'] : ['permission', 'request', 'direct', 'other', 'short'];
    }
    if (kind === 'activity') return ['permission', 'request', 'direct', 'other', 'short'];
    if (kind === 'act') return ['request', 'direct', 'other', 'short'];
    return ['request', 'permission', 'direct', 'other', 'short'];
  };

  const gen = (t: Token & { lex: PersonLex }) => t.lex.genBy?.[t.surface] ?? genitiveForm(t.surface);
  const loc = (t: Token & { lex: PlaceLex | BodyLex }) => t.lex.locBy?.[t.surface] ?? locativeForm(t.surface);
  const verbOf = (lex: ActivityLex): VerbForms => lex.verbForms ?? VERBS[lex.verb];

  let addresseeCompanionUsed = false;
  const withCompanion = (person: (Token & { lex: PersonLex }) | undefined, allowAddressee: boolean) => {
    if (person) return `${gen(person)} সাথে `;
    if (allowAddressee && addresseeDropped && !addresseeCompanionUsed) {
      addresseeCompanionUsed = true;
      return apni ? 'আপনার সাথে ' : 'তোমার সাথে ';
    }
    return '';
  };

  /** Listener-directed act, e.g. help with prefix "আমাকে একটু". */
  const actForms = (id: ActId, prefix: string, qPrefix = prefix): Forms => {
    const a = ACTS[id];
    const needsKi = a.aQ.endsWith('পারবেন');
    const p = prefix ? `${prefix} ` : '';
    let q: string;
    if (apni) {
      const parts = qPrefix ? qPrefix.split(' ') : [];
      q = needsKi
        ? parts.length
          ? `${[parts[0], 'কি', ...parts.slice(1)].join(' ')} ${a.aQ}?`
          : `আপনি কি ${a.aQ}?`
        : `${qPrefix ? `${qPrefix} ` : ''}${a.aQ}?`;
    } else {
      q = `${qPrefix ? `${qPrefix} ` : ''}${a.tQ}?`;
    }
    return {
      direct: apni ? `দয়া করে ${p}${a.aImp}।` : `${p}${a.tImp}।`,
      request: q,
      short: apni ? `${a.aImp}।` : `${a.tImp}।`,
    };
  };

  const clauses: Clause[] = [];
  const push = (forms: Forms, kind: OrderKind, requestable: boolean, rank: number) =>
    clauses.push({ forms, order: order(kind), requestable, rank });

  // --- urgent ---------------------------------------------------------------
  for (const t of unused('urgent')) {
    t.used = true;
    push({ direct: t.lex.direct, request: apni ? t.lex.reqA : t.lex.reqT, short: t.lex.short }, 'statement', false, RANK.urgent);
  }

  // --- symptoms -------------------------------------------------------------
  for (const t of unused('symptom')) {
    t.used = true;
    const body = t.lex.body ? take('body') : undefined;
    const tpl = body && t.lex.body ? t.lex.body : t.lex;
    const fill = (s: string) => (body ? s.replace('{b}', loc(body)).replace('{base}', body.surface) : s).replace('{w}', t.surface);
    const negated = isNegated(t, body);
    const direct = fill(negated ? t.lex.neg : intensity ? tpl.strong : tpl.plain);
    push(
      {
        direct,
        warm: intensity || negated ? undefined : fill(tpl.strong),
        request: negated ? undefined : `${direct.replace(/।$/, '')}, একটু দেখ${apni ? 'বেন' : 'বে'}?`,
        short: negated ? undefined : fill(tpl.short),
      },
      'statement',
      false,
      RANK.symptom,
    );
  }

  // --- feelings -------------------------------------------------------------
  for (const t of unused('feeling')) {
    t.used = true;
    const fill = (s: string) => s.replace('{w}', t.surface);
    const negated = isNegated(t);
    push(
      {
        direct: fill(negated ? t.lex.neg : intensity ? t.lex.strong : t.lex.plain),
        warm: negated || intensity ? undefined : fill(t.lex.strong),
        short: negated ? undefined : fill(t.lex.short),
      },
      'statement',
      false,
      RANK.feeling,
    );
  }

  // --- object clause (used by activities and plain objects) -----------------
  const objectClause = (t: Token & { lex: ObjectLex }, explicitVerb: VerbForms | null, give: boolean, negated: boolean) => {
    const lex = t.lex;
    const w = t.surface;
    const verb = explicitVerb ?? (lex.verb && !desire && !give ? VERBS[lex.verb] : null);
    const permVerb = explicitVerb ?? (lex.verb ? VERBS[lex.verb] : null);

    const qty = (): string => {
      if (lex.unit === 'mass') return more ? `আরো একটু ${w}` : `একটু ${w}`;
      if (lex.unit === 'count') return more ? `আরো একটা ${w}` : `একটা ${w}`;
      if (lex.unit === 'thing') return more ? `আরো ${w}` : `${w}টা`;
      return more ? `আরো ${w}` : w;
    };
    const q = qty();
    const withVerbWord = lex.unit === 'thing' || lex.unit === 'plain' ? w : q;
    const giveImp = apni ? `দয়া করে আমাকে ${q} দিন।` : `আমাকে ${q} দাও।`;
    const want = `আমি ${q} চাই।`;
    const needWord = lex.medical || lex.unit === 'mass' || lex.unit === 'plain' ? w : q;
    const need = `আমার ${needWord} লাগবে।`;

    let direct: string;
    if (negated) direct = verb ? `আমি ${w} ${verb.inf} চাই না।` : `আমি ${w} চাই না।`;
    else if (give) direct = giveImp;
    else if (desire === 'need' || (desire !== 'want' && (lex.needFirst || (!verb && (lex.unit === 'thing' || lex.unit === 'plain'))))) {
      direct = need;
    } else if (verb) direct = `আমি ${withVerbWord} ${verb.inf} চাই।`;
    else direct = want;

    push(
      {
        direct,
        request: negated
          ? `আমাকে ${w} ${apni ? ACTS.give.aNeg : ACTS.give.tNeg}।`
          : apni
            ? `আমাকে কি ${q} ${ACTS.give.aQ}?`
            : `আমাকে ${q} ${ACTS.give.tQ}?`,
        permission:
          permVerb && !negated ? (apni ? `আমি কি ${q} ${permVerb.inf} পারি?` : `আমি ${q} ${permVerb.subj}?`) : undefined,
        other: negated ? undefined : give ? (lex.needFirst ? need : want) : giveImp,
        short: negated ? `${w} না।` : verb ? `${w} ${verb.fut}।` : direct === need ? `${w} লাগবে।` : `${w} চাই।`,
      },
      give ? 'act' : 'object',
      true,
      RANK.main,
    );
  };

  // --- place clause ----------------------------------------------------------
  const placeClause = (t: Token & { lex: PlaceLex }, companion: (Token & { lex: PersonLex }) | undefined, negated: boolean) => {
    const l = loc(t);
    const comp = withCompanion(companion, false);
    const takeAct = take('act', (a) => a.lex.act === 'take');
    const takeImp = apni ? `দয়া করে আমাকে একটু ${l} নিয়ে যান।` : `আমাকে একটু ${l} নিয়ে যাও।`;
    const takeQ = apni ? `আমাকে কি একটু ${l} নিয়ে যেতে পারবেন?` : `আমাকে একটু ${l} নিয়ে যাবে?`;
    const wantGo = negated ? `আমি ${comp}${l} যেতে চাই না।` : `আমি ${comp}${l} যেতে চাই।`;

    push(
      {
        direct: takeAct && !negated ? takeImp : wantGo,
        permission: negated ? undefined : apni ? `আমি কি একটু ${comp}${l} যেতে পারি?` : `আমি একটু ${comp}${l} যাই?`,
        // "Take me with Ammu" is odd; with a companion only offer permission.
        request: negated || (apni && companion) ? undefined : takeQ,
        other: negated
          ? undefined
          : takeAct
            ? wantGo
            : companion && !apni && companion.lex.vocative
              ? `${companion.surface}, আমাকে একটু ${l} নিয়ে যাবে?`
              : undefined,
        short: negated ? `${comp}${l} যাব না।` : `${comp}${l} যাব।`,
      },
      takeAct ? 'act' : 'place',
      true,
      RANK.main,
    );
  };

  // --- activities -----------------------------------------------------------
  for (const t of unused('activity')) {
    t.used = true;
    const lex = t.lex;
    const v = verbOf(lex);

    if (lex.verb === 'go' && !lex.verbForms) {
      const place = take('place');
      if (place) {
        placeClause(place, take('person'), isNegated(place, t));
        continue;
      }
    }

    if (lex.verb === 'eat' && !lex.verbForms) {
      const food = take('object', (o) => o.lex.verb === 'eat' || o.lex.unit === 'plain');
      if (food) {
        objectClause(food, VERBS.eat, false, isNegated(food, t));
        continue;
      }
    }

    const object =
      lex.verbForms || lex.verb === 'eat' ? undefined : take('object', (o) => o.lex.verb === lex.verb || o.lex.unit === 'plain');
    const place = lex.verb === 'go' ? undefined : take('place');
    const companion = take('person');
    const coreParts = [
      withCompanion(companion, SOCIAL_VERBS.includes(lex.verb) && !lex.verbForms).trim(),
      place ? loc(place) : '',
      object ? object.surface : '',
    ].filter(Boolean);
    if (lex.verb === 'eat' && !lex.verbForms && coreParts.length === 0) coreParts.push('কিছু');
    const core = coreParts.length ? `${coreParts.join(' ')} ` : '';
    const soft = coreParts.length === 0 && lex.verb !== 'go' && lex.verb !== 'answer' ? 'একটু ' : '';
    const negated = isNegated(t, object, place);
    const helpable = ['sit', 'turn', 'bathe', 'go'].includes(lex.verb) && !lex.verbForms;

    push(
      {
        direct: negated ? `আমি ${core}${v.inf} চাই না।` : `আমি ${soft}${core}${v.inf} চাই।`,
        permission: negated ? undefined : apni ? `আমি কি ${soft || 'একটু '}${core}${v.inf} পারি?` : `আমি ${soft || 'একটু '}${core}${v.subj}?`,
        request: negated
          ? undefined
          : lex.verb === 'eat' && !lex.verbForms && !object
            ? apni
              ? 'আমাকে কি কিছু খেতে দিতে পারবেন?'
              : 'আমাকে কিছু খেতে দেবে?'
            : helpable
              ? apni
                ? `আমাকে কি একটু ${core}${v.inf} সাহায্য করতে পারবেন?`
                : `আমাকে একটু ${core}${v.inf} সাহায্য করবে?`
              : undefined,
        short: negated ? `${core}${v.fut} না।` : `${core}${v.fut}।`,
      },
      'activity',
      true,
      RANK.main,
    );
  }

  // --- places ---------------------------------------------------------------
  for (const t of unused('place')) {
    t.used = true;
    placeClause(t, take('person'), isNegated(t));
  }

  // --- objects --------------------------------------------------------------
  for (const t of unused('object')) {
    t.used = true;
    const give = take('act', (a) => a.lex.act === 'give');
    objectClause(t, null, !!give, isNegated(t));
  }

  // --- transport ------------------------------------------------------------
  for (const t of unused('transport')) {
    t.used = true;
    const call = take('act', (a) => a.lex.act === 'call');
    const w = t.surface;
    const imp = apni ? `দয়া করে একটা ${w} ডেকে দিন।` : `একটা ${w} ডেকে দাও।`;
    const need = `আমার একটা ${w} লাগবে।`;
    push(
      {
        direct: call ? imp : need,
        request: apni ? `একটা ${w} কি ডেকে দিতে পারবেন?` : `একটা ${w} ডেকে দেবে?`,
        other: call ? need : imp,
        short: `${w} লাগবে।`,
      },
      'act',
      true,
      RANK.main,
    );
  }

  // --- listener-directed acts -----------------------------------------------
  for (const t of unused('act')) {
    t.used = true;
    const id = t.lex.act;
    if (id === 'call') {
      const person = take('person');
      if (person) {
        const mine = apni && person.lex.possessive ? 'আমার ' : '';
        const target = `${mine}${person.surface}কে`;
        push(
          {
            direct: apni ? `দয়া করে ${target} একটু ডেকে দিন।` : `${target} একটু ডেকে দাও।`,
            request: apni ? `${target} কি একটু ডেকে দিতে পারবেন?` : `${target} একটু ডেকে দেবে?`,
            other: `আমি ${mine}${gen(person)} কাছে যেতে চাই।`,
            short: apni ? `${person.surface}কে ডাকুন।` : `${person.surface}কে ডাকো।`,
          },
          'act',
          true,
          RANK.main,
        );
      } else {
        meaningUncertain = true;
        push(actForms('call', 'কাউকে একটু'), 'act', true, RANK.main);
      }
      continue;
    }
    const prefixes: Record<ActId, [string, string?]> = {
      help: ['আমাকে একটু'],
      give: ['আমাকে'],
      take: ['আমাকে একটু'],
      call: ['কাউকে একটু'],
      wait: ['একটু'],
      stop: ['', 'একটু'],
      come: ['একটু'],
      repeat: [''],
    };
    const [prefix, qPrefix] = prefixes[id];
    const forms = actForms(id, prefix, qPrefix ?? prefix);
    if (id === 'help') forms.other = 'আমার একটু সাহায্য লাগবে।';
    if (id === 'give' || id === 'take') meaningUncertain = true;
    push(forms, 'act', true, RANK.main);
  }

  // --- "more" on its own ----------------------------------------------------
  if (more && clauses.every((c) => c.rank !== RANK.main)) {
    push(
      {
        direct: apni ? 'দয়া করে আমাকে আরো একটু দিন।' : 'আমাকে আরো একটু দাও।',
        request: apni ? 'আমাকে কি আরো একটু দিতে পারবেন?' : 'আমাকে আরো একটু দেবে?',
        other: 'আমি আরো চাই।',
        short: 'আরো।',
      },
      'act',
      true,
      RANK.main,
    );
  }

  // --- phrases --------------------------------------------------------------
  let intimateUsed = false;
  for (const t of unused('phrase')) {
    t.used = true;
    const p = t.lex;
    if (p.intimate) intimateUsed = true;
    push(
      {
        direct: apni ? p.apni : p.tumi,
        warm: apni ? p.warmA : p.warmT,
        request: apni ? p.reqA : p.reqT,
        short: apni ? p.shortA : p.shortT,
      },
      'statement',
      !!(p.reqA || p.reqT),
      p.position === 'end' ? RANK.phraseEnd : RANK.phraseStart,
    );
  }

  // --- remaining people: vocative or "please call" ---------------------------
  let vocative: string | null = null;
  for (const t of unused('person')) {
    t.used = true;
    const others = clauses.length > 0;
    if (others && !apni && t.lex.vocative && !vocative) {
      vocative = t.surface;
      continue;
    }
    meaningUncertain = true;
    const mine = apni && t.lex.possessive ? 'আমার ' : '';
    const target = `${mine}${t.surface}কে`;
    push(
      {
        direct: apni ? `দয়া করে ${target} একটু ডেকে দিন।` : `${target} একটু ডেকে দাও।`,
        request: apni ? `${target} কি একটু ডেকে দিতে পারবেন?` : `${target} একটু ডেকে দেবে?`,
        other: `আমি ${mine}${gen(t)} কাছে যেতে চাই।`,
        short: apni ? `${t.surface}কে ডাকুন।` : `${t.surface}কে ডাকো।`,
      },
      'act',
      true,
      RANK.main,
    );
  }
  if (honorific) vocative = honorific;

  // --- body part without a symptom ------------------------------------------
  for (const t of unused('body')) {
    t.used = true;
    meaningUncertain = true;
    push(
      { direct: `আমার ${loc(t)} সমস্যা হচ্ছে।`, other: `আমার ${loc(t)} ব্যথা করছে।`, short: `${t.surface}।` },
      'statement',
      false,
      RANK.symptom,
    );
  }

  // --- a bare "I want / I need" ---------------------------------------------
  if (clauses.length === 0 && desire) {
    meaningUncertain = true;
    push(
      desire === 'need' ? { direct: 'আমার কিছু লাগবে।', short: 'দরকার।' } : { direct: 'আমি কিছু চাই।', short: 'চাই।' },
      'statement',
      false,
      RANK.main,
    );
  }

  if (clauses.length === 0) {
    throw new LLMError('empty_input', 'Nothing to say: select a symbol or type a keyword.');
  }

  // ---------------------------------------------------------------------------
  // 4. Assemble
  // ---------------------------------------------------------------------------
  clauses.sort((a, b) => a.rank - b.rank);
  const requestables = clauses.filter((c) => c.requestable);
  const head = requestables.length ? requestables[requestables.length - 1] : clauses[0];

  const addTime = (text: string) => {
    if (!timeAdverb) return text;
    const replaced = text.replace(/^(আমি কি|আমাকে কি|আমার|আমাকে|আমি) /, (m) => `${m}${timeAdverb} `);
    return replaced === text ? `${timeAdverb} ${text}` : replaced;
  };

  let styles = head.order.filter((s) => head.forms[s]);
  if (please) styles = [...styles.filter((s) => s === 'request'), ...styles.filter((s) => s !== 'request')];

  const seen = new Set<string>();
  const options: SentenceOption[] = [];
  for (const style of styles) {
    const parts = clauses.map((c) => {
      const s: SentenceStyle = c === head ? style : style === 'short' ? 'short' : 'direct';
      const text = c.forms[s] ?? c.forms.direct;
      return c === head ? addTime(text) : text;
    });
    let text = parts.join(' ');
    if (vocative) text = `${vocative}, ${text}`;
    if (!seen.has(text)) {
      seen.add(text);
      options.push({ text, style });
    }
  }

  const pickFirst = (wanted: SentenceStyle[]) => options.find((o) => wanted.includes(o.style));
  let chosen: SentenceOption = options[0];
  if (request.style === 'shorter') {
    chosen = pickFirst(['short']) ?? [...options].sort((a, b) => a.text.length - b.text.length)[0];
  } else if (request.style === 'politer') {
    chosen = pickFirst(['request', 'permission']) ?? options[0];
  } else if (request.style === 'simpler') {
    const base = pickFirst(['direct']) ?? options[0];
    chosen = { text: base.text.replace(/ একটু/g, '').replace(/^দয়া করে /, ''), style: base.style };
  }
  const ordered = [chosen, ...options.filter((o) => o.text !== chosen.text)];
  const primary = ordered[request.variant % ordered.length];
  const alternatives = ordered.filter((o) => o.text !== primary.text).slice(0, 3);

  // ---------------------------------------------------------------------------
  // 5. Assess confidence
  // ---------------------------------------------------------------------------
  let registerConfidence: ConfidenceLevel = register.pronounCertain ? 'high' : 'medium';
  if (!register.pronounCertain) warnings.push({ code: 'register_uncertain' });

  const conflictWords: string[] = [];
  let conflictLevel: ConfidenceLevel | null = null;
  for (const hint of pronounHints) {
    if (hint.pronoun === 'tui' || hint.pronoun !== register.pronoun) {
      conflictWords.push(hint.word);
      conflictLevel = 'low';
    }
  }
  if (honorific && !apni) {
    conflictWords.push(honorific);
    conflictLevel = conflictLevel ?? 'medium';
  }
  if (intimateUsed && register.id !== 'family' && register.id !== 'friend') {
    conflictLevel = conflictLevel ?? 'medium';
  }
  if (conflictLevel) {
    registerConfidence = conflictLevel === 'low' || registerConfidence === 'medium' ? 'low' : 'medium';
    warnings.push({ code: 'register_conflict', words: conflictWords.length ? conflictWords : undefined });
  }

  let vocabularyConfidence: ConfidenceLevel = 'high';
  const contentCount = Math.max(1, tokens.filter((t) => !['mod', 'pronoun', 'honorific'].includes(t.lex.kind)).length);
  if (unknownWords.length) {
    vocabularyConfidence = unknownWords.length * 2 >= contentCount ? 'low' : 'medium';
    warnings.push({ code: 'unknown_words', words: unknownWords });
  }
  // Templates for educator-added actions/feelings/symptoms are guesses.
  const genericGuess = tokens.some((t) => t.generic && !t.unknown && ['activity', 'feeling', 'symptom'].includes(t.lex.kind));
  if (genericGuess || clauses.length > 3) meaningUncertain = true;
  const genericUsed = tokens.some((t) => t.generic && !t.unknown);
  if ((genericUsed || meaningUncertain) && vocabularyConfidence === 'high') vocabularyConfidence = 'medium';
  if (meaningUncertain) warnings.push({ code: 'meaning_uncertain' });

  const healthRelated = tokens.some((t) => t.lex.kind === 'symptom' || (t.lex.kind === 'object' && t.lex.medical));
  if (register.id === 'doctor' && healthRelated) warnings.push({ code: 'medical_boundary' });

  return {
    sentence: primary.text,
    style: primary.style,
    alternatives,
    registerConfidence,
    vocabularyConfidence,
    warnings,
    register: register.id,
    source: 'mock',
    createdAt: Date.now(),
  };
}
