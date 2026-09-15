import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeakingBars } from '@/components/SpeakingBars';
import { ActionButton } from '@/components/ui/ActionButton';
import { IconButton } from '@/components/ui/IconButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Txt } from '@/components/ui/Txt';
import { PRONOUN_LABEL, REGISTER_BY_ID } from '@/data/registers';
import { useTheme } from '@/hooks/useTheme';
import { SPEECH_RATES } from '@/storage/preferences';
import { useComposer } from '@/state/ComposerContext';
import { useHistory } from '@/state/HistoryContext';
import { usePreferences } from '@/state/PreferencesContext';
import { useSpeech } from '@/state/SpeechContext';
import { gradients, radius, shadows } from '@/theme';

const RATE_LABELS = ['খুব ধীর', 'ধীর', 'স্বাভাবিক', 'দ্রুত', 'খুব দ্রুত'];

const ORIGIN_LABEL = {
  ai: 'AI-সহায়তায় · AI-ASSISTED',
  edited: 'আপনার এডিট করা · EDITED',
  'own-words': 'নিজের শব্দ · YOUR WORDS',
  history: 'আগের বাক্য · SAVED',
} as const;

/** Full-screen display of the final message, for showing or speaking. */
export default function MessageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c, highContrast } = useTheme();
  const { message, finish, generation, startManualEdit } = useComposer();
  const { preferences, updatePreferences } = usePreferences();
  const { speaking, speak, stop } = useSpeech();
  const history = useHistory();

  if (!message) return <Redirect href="/" />;

  const register = message.register ? REGISTER_BY_ID[message.register] : null;
  const entry = history.entries.find((e) => e.text === message.text && e.register === message.register);
  const len = message.text.length;
  const size = len < 30 ? 38 : len < 60 ? 32 : len < 110 ? 27 : 23;
  const rateIndex = Math.max(
    0,
    SPEECH_RATES.findIndex((r) => Math.abs(r - preferences.speechRate) < 0.01),
  );

  const done = async () => {
    await stop();
    finish();
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  const edit = () => {
    const fromGeneration = (message.origin === 'ai' || message.origin === 'edited') && generation.status === 'done';
    if (fromGeneration && router.canGoBack()) {
      router.back();
    } else {
      startManualEdit(message.text);
      router.replace('/generate');
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: c.outCanvas,
          experimental_backgroundImage: highContrast ? undefined : gradients.output,
          paddingTop: insets.top,
        },
      ]}>
      <ScreenHeader
        title="বার্তা"
        subtitle={register ? `MESSAGE TO ${register.en.toUpperCase()}` : 'MESSAGE'}
        titleColor={c.outInk}
        subtitleColor={c.outFaint}
        right={
          message.origin === 'ai' || message.origin === 'edited' ? (
            <View style={[styles.aiBadge, { backgroundColor: highContrast ? '#fff' : c.labelBg, borderColor: highContrast ? '#000' : 'transparent' }]}>
              <Txt size={12} weight={700} color={c.labelFg}>
                ✨ AI-সহায়তা
              </Txt>
            </View>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.center}>
        <View
          style={[
            styles.card,
            { backgroundColor: c.surface, borderColor: c.outCardBorder, boxShadow: highContrast ? undefined : '0px 14px 34px -18px rgba(40,120,80,0.45)' },
          ]}>
          <Txt font="en" size={11} weight={800} color={c.outFaint} tracking={1} align="center">
            {ORIGIN_LABEL[message.origin]}
          </Txt>
          <Txt
            size={size}
            weight={600}
            color={c.body}
            align="center"
            leading={1.5}
            selectable
            accessibilityRole="text"
            accessibilityLiveRegion="polite">
            {message.text}
          </Txt>
          {register ? (
            <Txt size={14} weight={700} color={c.outFaint} align="center">
              {register.icon} {register.label} · &quot;{PRONOUN_LABEL[register.pronoun]}&quot;
            </Txt>
          ) : null}
          <SpeakingBars active={speaking} />
        </View>
      </ScrollView>

      <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.outLine, paddingBottom: insets.bottom + 14, boxShadow: shadows.sheet }]}>
        <ActionButton
          icon={speaking ? '⏹' : '🔊'}
          label={speaking ? 'থামাও · Stop' : 'বলো · Speak'}
          variant="speak"
          size="lg"
          onPress={() => (speaking ? void stop() : void speak(message.text))}
        />
        <View style={styles.row}>
          <ActionButton
            icon="⟲"
            label="আবার"
            sublabel="REPEAT"
            layout="column"
            onPress={async () => {
              await stop();
              void speak(message.text);
            }}
            style={styles.flex}
          />
          <ActionButton
            icon={entry?.favorite ? '♥' : '♡'}
            label={entry?.favorite ? 'প্রিয় ✓' : 'প্রিয়'}
            sublabel="FAVOURITE"
            layout="column"
            variant="fav"
            disabled={!entry}
            onPress={() => entry && history.toggleFavorite(entry.id)}
            accessibilityLabel={entry?.favorite ? 'প্রিয় থেকে সরান' : 'প্রিয়তে রাখুন'}
            style={styles.flex}
          />
          <ActionButton icon="✎" label="এডিট" sublabel="EDIT" layout="column" onPress={edit} style={styles.flex} />
          <ActionButton
            icon="✓"
            label="শেষ"
            sublabel="DONE"
            layout="column"
            onPress={() => void done()}
            accessibilityLabel="শেষ, নতুন বার্তা শুরু করুন"
            style={styles.flex}
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.rate, { borderColor: c.lineSoft, backgroundColor: c.surfaceWarm }]}>
            <IconButton
              icon="🐢"
              label="ধীরে বলুন"
              onPress={() => updatePreferences({ speechRate: SPEECH_RATES[Math.max(0, rateIndex - 1)] })}
              disabled={rateIndex === 0}
            />
            <Txt size={14} weight={700} color={c.muted} align="center" style={styles.flex}>
              {RATE_LABELS[rateIndex]}
            </Txt>
            <IconButton
              icon="🐇"
              label="দ্রুত বলুন"
              onPress={() => updatePreferences({ speechRate: SPEECH_RATES[Math.min(SPEECH_RATES.length - 1, rateIndex + 1)] })}
              disabled={rateIndex === SPEECH_RATES.length - 1}
            />
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: preferences.ttsEnabled }}
            accessibilityLabel="কণ্ঠ চালু বা বন্ধ"
            onPress={() => updatePreferences({ ttsEnabled: !preferences.ttsEnabled })}
            style={({ pressed }) => [
              styles.sound,
              {
                backgroundColor: preferences.ttsEnabled ? '#f1f8f2' : '#fdeee9',
                borderColor: preferences.ttsEnabled ? '#cfe6d4' : '#f3d4c7',
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}>
            <Txt size={15} weight={800} color={preferences.ttsEnabled ? '#3a7a4e' : '#b5572e'}>
              {preferences.ttsEnabled ? '🔊 শব্দ' : '🔇 নীরব'}
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  aiBadge: { paddingHorizontal: 11, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1 },
  center: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  card: { borderRadius: radius.xxl, borderWidth: 2, paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', gap: 16 },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  row: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  flex: { flex: 1 },
  rate: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: radius.lg, padding: 4 },
  sound: { minHeight: 56, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
