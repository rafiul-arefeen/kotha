import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlternativeList } from '@/components/AlternativeList';
import { ConfidenceWarning } from '@/components/ConfidenceWarning';
import { RegisterPill, RegisterSelector } from '@/components/RegisterSelector';
import { SentencePreview } from '@/components/SentencePreview';
import { StyleModifiers } from '@/components/StyleModifiers';
import { ActionButton } from '@/components/ui/ActionButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Txt } from '@/components/ui/Txt';
import { SOURCE_LABELS, STYLE_LABELS } from '@/data/messages';
import { REGISTER_BY_ID } from '@/data/registers';
import { useMessageActions } from '@/hooks/useMessageActions';
import { useTheme } from '@/hooks/useTheme';
import { useComposer } from '@/state/ComposerContext';
import { usePreferences } from '@/state/PreferencesContext';
import { useSpeech } from '@/state/SpeechContext';
import { radius, shadows } from '@/theme';

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const { c, tile, highContrast } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const composer = useComposer();
  const { speaking } = useSpeech();
  const { speakMessage, displayMessage } = useMessageActions();
  const [editing, setEditing] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const { items, generation, draft, edited, inputKey, generate } = composer;
  const register = preferences.register;
  const canGenerate = items.length > 0 && !!register;
  const loading = generation.status === 'loading';
  const result = generation.status === 'done' ? generation.result : null;

  // Generate automatically when arriving with new or changed input.
  useEffect(() => {
    if (canGenerate && generation.inputKey !== inputKey && generation.status !== 'loading') {
      void generate();
    }
  }, [canGenerate, generation.inputKey, generation.status, inputKey, generate]);

  if (items.length === 0 && !draft && generation.status === 'idle') {
    return <Redirect href="/" />;
  }

  if (!register) {
    // Never pick a register silently: ask first.
    return (
      <View style={[styles.screen, { backgroundColor: c.aiCanvas, paddingTop: insets.top }]}>
        <ScreenHeader title="AI বাক্য বানাও" subtitle="AI SENTENCE" titleColor={c.aiInk} subtitleColor={c.aiFaint} />
        <RegisterSelector
          visible
          value={null}
          note="বাক্যটি কার জন্য, আগে বেছে নিন।"
          onClose={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          onSelect={(id) => updatePreferences({ register: id })}
        />
      </View>
    );
  }

  const registerInfo = REGISTER_BY_ID[register];
  const outgoing = () => ({
    text: draft.trim(),
    origin: edited || !result ? ('edited' as const) : ('ai' as const),
    register,
    inputs: composer.inputLabels,
  });

  return (
    <View style={[styles.screen, { backgroundColor: c.aiCanvas, paddingTop: insets.top }]}>
      <ScreenHeader
        title="AI বাক্য বানাও"
        subtitle={`AI SENTENCE · FOR ${registerInfo.en.toUpperCase()}`}
        titleColor={c.aiInk}
        subtitleColor={c.aiFaint}
        right={<RegisterPill registerId={register} onPress={() => setRegisterOpen(true)} />}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {items.length > 0 ? (
          <View style={[styles.inputs, { backgroundColor: c.surface, borderColor: c.aiCardLine }]}>
            <Txt size={13} weight={800} color={c.aiFaint}>
              আপনি বেছেছেন
            </Txt>
            {items.map((item) => {
              const colors =
                item.type === 'symbol' ? tile(item.category) : { bg: c.surface, fg: c.inkSoft, border: c.line, active: c.ink };
              return (
                <View
                  key={item.key}
                  style={[
                    styles.inputChip,
                    { backgroundColor: colors.bg, borderColor: highContrast ? '#000' : colors.border, borderStyle: item.type === 'symbol' ? 'solid' : 'dashed' },
                  ]}>
                  <Txt size={15} weight={600} color={colors.fg} leading={1.4}>
                    {item.type === 'symbol' ? `${item.icon} ${item.label}` : `✍️ ${item.text}`}
                  </Txt>
                </View>
              );
            })}
          </View>
        ) : null}

        <SentencePreview
          text={draft}
          onChangeText={composer.setDraft}
          editing={editing}
          onToggleEdit={() => setEditing((e) => !e)}
          loading={loading}
          speaking={speaking}
          edited={edited}
          styleLabel={result && !edited ? STYLE_LABELS[result.style] : undefined}
          sourceLabel={result ? SOURCE_LABELS[result.source] : undefined}
        />

        {generation.status === 'error' && generation.error ? (
          <View style={[styles.error, { backgroundColor: c.dangerBg, borderColor: c.dangerLine }]} accessibilityRole="alert">
            <Txt size={16} weight={700} color={c.dangerFg}>
              {generation.error}
            </Txt>
            <ActionButton icon="⟲" label="আবার চেষ্টা" sublabel="TRY AGAIN" onPress={() => void generate()} />
          </View>
        ) : null}

        {result ? <ConfidenceWarning result={result} /> : null}

        {items.length > 0 ? (
          <StyleModifiers
            active={generation.style}
            disabled={loading || !canGenerate}
            onStyle={(style) => {
              setEditing(false);
              void generate({ style });
            }}
            onRegenerate={() => {
              setEditing(false);
              void generate({ style: generation.style, nextVariant: true });
            }}
          />
        ) : null}

        {result && !loading ? (
          <AlternativeList
            options={result.alternatives}
            onChoose={(option) => {
              setEditing(false);
              composer.chooseAlternative(option);
            }}
          />
        ) : null}

        <Txt size={13} weight={700} color={c.aiFaint} align="center" style={styles.footnote}>
          ✓ AI শুধু প্রস্তাব দেয় — আপনি দেখে নিশ্চিত করলে তবেই বলবে{'\n'}
          <Txt font="en" size={11} weight={700} color={c.aiFaint}>
            AI suggests — you decide what is said
          </Txt>
        </Txt>
      </ScrollView>

      <View
        style={[
          styles.bar,
          { backgroundColor: c.surface, borderColor: c.aiCardLine, paddingBottom: insets.bottom + 12, boxShadow: shadows.sheet },
        ]}>
        <ActionButton
          icon="🔊"
          label="বলো · Speak"
          variant="speak"
          size="lg"
          disabled={!draft.trim() || loading}
          onPress={() => speakMessage(outgoing())}
          accessibilityLabel="বাক্যটি বলো"
        />
        <View style={styles.barRow}>
          <ActionButton
            icon="👁️"
            label="দেখাও"
            sublabel="DISPLAY"
            layout="column"
            disabled={!draft.trim() || loading}
            onPress={() => displayMessage(outgoing())}
            style={styles.flex}
          />
          <ActionButton
            icon="⟲"
            label="নতুন করে"
            sublabel="REGENERATE"
            layout="column"
            disabled={!canGenerate || loading}
            onPress={() => {
              setEditing(false);
              void generate({ style: generation.style, nextVariant: true });
            }}
            style={styles.flex}
          />
          <ActionButton
            icon="🗑️"
            label="মুছুন"
            sublabel="CLEAR"
            layout="column"
            variant="danger"
            disabled={!draft || loading}
            onPress={() => {
              composer.setDraft('');
              setEditing(true);
            }}
            accessibilityLabel="বাক্য মুছে নিজে লিখুন"
            style={styles.flex}
          />
        </View>
      </View>

      <RegisterSelector
        visible={registerOpen}
        value={register}
        onClose={() => setRegisterOpen(false)}
        onSelect={(id) => {
          updatePreferences({ register: id });
          setRegisterOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  inputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  inputChip: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 9 },
  error: { borderWidth: 1.5, borderRadius: radius.md, padding: 12, gap: 10 },
  footnote: { marginTop: 4 },
  bar: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  barRow: { flexDirection: 'row', gap: 9 },
  flex: { flex: 1 },
});
