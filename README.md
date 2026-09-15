# কথা · Kotha

**An LLM-assisted Bangla AAC system for users with speech and motor impairments.**

Kotha lets someone communicate by tapping picture symbols and/or typing a few
Bangla keywords. It turns them into a complete, register-appropriate Bangla
sentence (তুমি / আপনি) using Google Gemini, and the user reviews, edits, then
speaks it aloud or shows it on screen.

> Research prototype. Symbol images are emoji placeholders. Gemini is called
> through a small API that runs on your laptop inside the Expo dev server.

## Flow

**Open app → select symbols / type keywords → choose who the message is for →
generate Bangla sentence → review / edit → speak or display**

Example: 💧 পানি + 👉 চাই

| Listener | Generated |
|---|---|
| পরিবার | আমি একটু পানি চাই। |
| শিক্ষক | আমি কি একটু পানি খেতে পারি? |
| ডাক্তার | আমাকে কি একটু পানি দিতে পারবেন? |

## Running with Expo Go (phone) + laptop server

Requirements: Node 22+, and Expo Go on an Android phone on the **same Wi-Fi**
as the laptop.

1. Create `.env.local` from the example and add your Gemini key:

   ```bash
   cp .env.example .env.local
   # edit: GEMINI_API_KEY=...   (never in an EXPO_PUBLIC_ variable)
   ```

2. Start. This single command serves the app **and** the Kotha API
   (`/api/v1/generate` → Gemini):

   ```bash
   npm install
   npx expo start --clear
   ```

3. Scan the QR code with Expo Go. Check **সেটিংস → ✨ AI ও সংযোগ**: it should
   show "✓ Gemini … দিয়ে বাক্য তৈরি হচ্ছে।".

If the laptop server is unreachable or Gemini fails, Kotha falls back to a
cached or offline rule-based sentence, so it keeps working. To use only the
offline generator, set `EXPO_PUBLIC_LLM_MODE=mock`.

For spoken Bangla on Android, install a Bangla voice: Settings →
Text-to-speech → Google → Install voice data → বাংলা (বাংলাদেশ).

Other commands:

```bash
npx expo start --tunnel # if the Wi-Fi blocks phone ↔ laptop traffic
npm run typecheck       # TypeScript
npm run lint            # ESLint (eslint-config-expo)
```

## Features

- **Symbol grid** in 9 categories, plus a "frequently used" filter. Large tiles
  show a ✓ count badge when selected.
- **Bangla keyword input** that combines with symbols.
- **Register selector** for family, friend, teacher, doctor, stranger and carer.
  It is never chosen silently, and uncertain cases are flagged.
- **Gemini sentence generation** behind a provider-agnostic `LLMService`, with
  structured JSON output, alternatives, shorter/politer/simpler versions and
  regeneration. It falls back to cached, then offline, results.
- **Confidence warnings** in plain Bangla, e.g. "ভাষার ধরনটি যাচাই করে নিন।".
- **Always-editable sentence**, plus speak, display, clear and regenerate.
- **Bangla TTS** through a `TTSService`: on-device voice by default. The text
  always stays visible.
- **Motor accessibility**: touch targets of 48dp or more, dwell selection
  (off / 1 / 1.5 / 2 s) with visible progress, button and text size, high
  contrast, TalkBack labels.
- **Local-first storage** of history and favourites, symbol usage, cached
  generations and preferences. No account, analytics or ads.
- **Onboarding**, **history**, **settings**, and a **vocabulary editor** for
  educators and SLPs.

## Project structure

```text
src/
  app/            Screens (Expo Router) + api/v1/*+api.ts (laptop-side API routes)
  components/     SymbolGrid, SymbolTile, SelectedItems, KeywordInput,
                  RegisterSelector, SentencePreview, ConfidenceWarning,
                  DwellSelector, PhraseHistory, ServerStatus, …
  server/         Gemini client, request validation, rate limit (server only)
  services/
    llm/          LLMService, MockLLMService, RealLLMService, prompt, wire format
      mock/       Offline rule-based Bangla composer + lexicon
    tts/          TTSService, DeviceTTSService, MockTTSService, RealTTSService
    config.ts     Environment config; finds the laptop API automatically
  state/  storage/  hooks/  theme/  types/  utils/  data/
docs/API_INTEGRATION.md   Gemini/server setup, endpoint contract, testing
mockup/kotha-ui.html      Original HTML design reference
```

## Design and safety notes

- Kotha helps people *say* what they mean. It does not make medical
  decisions. With a doctor, it can phrase "আমার মাথা ব্যথা করছে।" but never
  diagnoses or suggests treatment.
- Generated text is a suggestion. Nothing is spoken until the user presses
  বলো.
- In Gemini mode, selected symbol labels and typed words are sent to Google.
  The Gemini key stays on the laptop.

Fonts: Baloo Da 2 and Nunito (SIL Open Font License), bundled with the app.
