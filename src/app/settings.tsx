import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DwellSelector } from '@/components/DwellSelector';
import { ServerStatus } from '@/components/ServerStatus';
import { ActionButton } from '@/components/ui/ActionButton';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Section } from '@/components/ui/Section';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { getLLMStatus } from '@/services/llm';
import { getTTSService, isTTSMisconfigured } from '@/services/tts';
import { clearGenerationCache, generationCacheSize } from '@/storage/generationCache';
import { SPEECH_RATES } from '@/storage/preferences';
import { useHistory } from '@/state/HistoryContext';
import { usePreferences } from '@/state/PreferencesContext';
import { useSpeech } from '@/state/SpeechContext';
import { useToast } from '@/state/ToastContext';
import { useVocabulary } from '@/state/VocabularyContext';
import { radius } from '@/theme';
import type { GridSize, TextScale } from '@/types';
import { toBanglaDigits } from '@/utils/bangla';
import { confirmAction } from '@/utils/confirm';

const RATE_OPTIONS = SPEECH_RATES.map((value, i) => ({
  value,
  label: ['খুব ধীর', 'ধীর', 'স্বাভাবিক', 'দ্রুত', 'খুব দ্রুত'][i],
  sub: `${value}×`,
}));

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { preferences: p, updatePreferences } = usePreferences();
  const { status, speak, refreshStatus } = useSpeech();
  const history = useHistory();
  const vocabulary = useVocabulary();
  const toast = useToast();
  const [cacheCount, setCacheCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    generationCacheSize().then((n) => alive && setCacheCount(n));
    return () => {
      alive = false;
    };
  }, []);

  const llm = getLLMStatus();
  const ttsKind = getTTSService().kind;
  const favorites = history.entries.filter((e) => e.favorite).length;

  const voiceText = (() => {
    if (isTTSMisconfigured()) return '⚠️ রিমোট ভয়েস চাওয়া হয়েছে কিন্তু সার্ভারের ঠিকানা নেই — ফোনের ভয়েস ব্যবহার হচ্ছে।';
    if (ttsKind === 'mock') return 'নমুনা ভয়েস (mock) — কোনো শব্দ বাজবে না, শুধু বলার সময়টুকু দেখাবে।';
    if (ttsKind === 'remote') return `সার্ভারের বাংলা ভয়েস: ${llm.apiUrl}`;
    if (!status) return 'ফোনের ভয়েস যাচাই করা হচ্ছে…';
    if (status.banglaVoice === 'available') return '✓ ফোনে বাংলা ভয়েস আছে — ইন্টারনেট ছাড়াও কাজ করবে।';
    if (status.banglaVoice === 'missing')
      return '⚠️ এই ফোনে বাংলা ভয়েস নেই। Settings → Text-to-speech → Google → Install voice data → বাংলা (বাংলাদেশ) ইনস্টল করুন। ততক্ষণ "দেখাও" দিয়ে লেখা দেখান।';
    return 'ফোনের ভয়েস এখনো যাচাই হয়নি — "ভয়েস পরীক্ষা" চাপুন।';
  })();

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas, paddingTop: insets.top }]}>
      <ScreenHeader title="সেটিংস" subtitle="SETTINGS · ACCESSIBILITY" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Section title="⏱️ ধরে রেখে বেছে নেওয়া" en="DWELL SELECTION" hint="হাত কাঁপলে বা ভুল জায়গায় চাপ পড়লে কাজে লাগে।">
          <DwellSelector value={p.dwellMs} onChange={(dwellMs) => updatePreferences({ dwellMs })} showTester />
        </Section>

        <Section title="বোতামের আকার" en="BUTTON SIZE">
          <OptionGroup<GridSize>
            accessibilityLabel="বোতামের আকার"
            value={p.gridSize}
            onChange={(gridSize) => updatePreferences({ gridSize })}
            options={[
              { value: 'large', label: 'বড়', sub: 'LARGE', icon: '⬛' },
              { value: 'medium', label: 'মাঝারি', sub: 'MEDIUM', icon: '▦' },
              { value: 'small', label: 'ছোট', sub: 'SMALL', icon: '▪️' },
            ]}
          />
        </Section>

        <Section title="লেখার আকার" en="TEXT SIZE">
          <OptionGroup<TextScale>
            accessibilityLabel="লেখার আকার"
            value={p.textScale}
            onChange={(textScale) => updatePreferences({ textScale })}
            options={[
              { value: 1, label: 'স্বাভাবিক', sub: 'NORMAL' },
              { value: 1.15, label: 'বড়', sub: 'LARGE' },
              { value: 1.3, label: 'আরো বড়', sub: 'LARGER' },
            ]}
          />
        </Section>

        <Section title="দেখা" en="DISPLAY">
          <ToggleRow
            icon="◐"
            label="হাই কনট্রাস্ট"
            sublabel="HIGH CONTRAST"
            value={p.highContrast}
            onChange={(highContrast) => updatePreferences({ highContrast })}
          />
          <ToggleRow
            icon="🔤"
            label="ইংরেজি সহায়ক লেখা"
            sublabel="SHOW ENGLISH LABELS ON SYMBOLS"
            value={p.showEnglish}
            onChange={(showEnglish) => updatePreferences({ showEnglish })}
          />
        </Section>

        <Section title="🔊 কণ্ঠ" en="VOICE (TEXT-TO-SPEECH)">
          <ToggleRow
            label="বাক্য পড়ে শোনানো"
            sublabel="SPEAK MESSAGES ALOUD"
            value={p.ttsEnabled}
            onChange={(ttsEnabled) => updatePreferences({ ttsEnabled })}
          />
          <OptionGroup
            accessibilityLabel="কথা বলার গতি"
            value={p.speechRate}
            onChange={(speechRate) => updatePreferences({ speechRate })}
            options={RATE_OPTIONS}
            columns={3}
          />
          <View style={[styles.info, { backgroundColor: c.surface, borderColor: c.lineSoft }]}>
            <Txt size={14} weight={600} color={c.muted}>
              {voiceText}
            </Txt>
          </View>
          <ActionButton
            icon="🔊"
            label="ভয়েস পরীক্ষা"
            sublabel="TEST VOICE"
            onPress={async () => {
              await speak('আমি কথা বলছি। আপনি কি শুনতে পাচ্ছেন?');
              refreshStatus();
            }}
          />
        </Section>

        <Section title="✨ AI ও সংযোগ" en="AI & CONNECTIONS">
          <ServerStatus />
          <Txt size={13} weight={600} color={c.faint}>
            সংযোগের বিস্তারিত নিয়ম: docs/API_INTEGRATION.md
          </Txt>
        </Section>

        <Section title="📚 শব্দভান্ডার" en="VOCABULARY" hint="শিক্ষক বা থেরাপিস্ট প্রতীক যোগ, নাম বদল বা বন্ধ করতে পারবেন।">
          <ActionButton icon="📚" label="প্রতীক ও শব্দ সাজান" sublabel="MANAGE SYMBOLS" onPress={() => router.push('/vocabulary')} />
        </Section>

        <Section title="🔒 তথ্য ও গোপনীয়তা" en="DATA & PRIVACY">
          <View style={[styles.info, { backgroundColor: c.surface, borderColor: c.lineSoft }]}>
            <Txt size={14} weight={600} color={c.muted}>
              ইতিহাস ও সেটিংস শুধু এই ফোনে থাকে। কোনো অ্যাকাউন্ট, বিজ্ঞাপন বা ব্যবহারের পরিসংখ্যান নেই।
              {llm.active === 'remote'
                ? ' AI চালু থাকায় বাক্য বানাতে বেছে নেওয়া প্রতীক ও লেখা শব্দগুলো ল্যাপটপের সার্ভার হয়ে Google Gemini-তে পাঠানো হয়।'
                : ''}
            </Txt>
            <Txt size={14} weight={700} color={c.inkSoft} style={styles.stats}>
              ইতিহাসে {toBanglaDigits(history.entries.length)}টি বাক্য · প্রিয় {toBanglaDigits(favorites)}টি · সংরক্ষিত AI বাক্য{' '}
              {cacheCount === null ? '…' : `${toBanglaDigits(cacheCount)}টি`}
            </Txt>
          </View>
          <ActionButton
            icon="🗑️"
            label="ইতিহাস মুছুন (প্রিয় বাদে)"
            variant="danger"
            onPress={() => confirmAction('ইতিহাস মুছবেন?', 'প্রিয় বাক্যগুলো থেকে যাবে।', 'হ্যাঁ, মুছুন', () => history.clear(false))}
          />
          <ActionButton
            icon="🗑️"
            label="প্রিয়সহ সব ইতিহাস মুছুন"
            variant="danger"
            onPress={() => confirmAction('সব ইতিহাস মুছবেন?', 'প্রিয় বাক্যসহ সব মুছে যাবে।', 'সব মুছুন', () => history.clear(true))}
          />
          <ActionButton
            icon="🧹"
            label="সংরক্ষিত AI বাক্য মুছুন"
            onPress={() =>
              confirmAction('সংরক্ষিত বাক্য মুছবেন?', 'অফলাইনে ব্যবহারের জন্য রাখা AI বাক্যগুলো মুছে যাবে।', 'মুছুন', async () => {
                await clearGenerationCache();
                setCacheCount(0);
                toast.show('সংরক্ষিত বাক্য মুছে ফেলা হয়েছে');
              })
            }
          />
          <ActionButton
            icon="⭐"
            label="ঘনঘন ব্যবহৃত প্রতীকের হিসাব মুছুন"
            onPress={() =>
              confirmAction('হিসাব মুছবেন?', '"ঘনঘন" বিভাগ খালি হয়ে যাবে।', 'মুছুন', () => {
                vocabulary.clearUsage();
                toast.show('হিসাব মুছে ফেলা হয়েছে');
              })
            }
          />
        </Section>

        <Section title="অন্যান্য" en="OTHER">
          <ActionButton icon="👋" label="পরিচিতি আবার দেখুন" sublabel="SHOW INTRODUCTION" onPress={() => updatePreferences({ onboarded: false })} />
          <Txt size={13} weight={600} color={c.faint} align="center">
            কথা · Kotha v1.0 — LLM-assisted Bangla AAC research prototype.{'\n'}প্রতীকের ছবি এখন ইমোজি (placeholder)।
          </Txt>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  info: { borderWidth: 1.5, borderRadius: radius.md, padding: 12, gap: 6 },
  stats: { marginTop: 4 },
});
