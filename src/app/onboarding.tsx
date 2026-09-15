import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DwellSelector } from '@/components/DwellSelector';
import { Logo } from '@/components/Logo';
import { ActionButton } from '@/components/ui/ActionButton';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Section } from '@/components/ui/Section';
import { Txt } from '@/components/ui/Txt';
import { ONBOARDING_STEPS } from '@/data/onboarding';
import { useTheme } from '@/hooks/useTheme';
import { usePreferences } from '@/state/PreferencesContext';
import { categoryColors, radius, shadows } from '@/theme';
import type { TextScale } from '@/types';
import { toBanglaDigits } from '@/utils/bangla';

const STEP_TINTS = [
  categoryColors.people,
  categoryColors.needs,
  categoryColors.food,
  categoryColors.phrases,
  categoryColors.places,
  categoryColors.feelings,
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { c, highContrast } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const [index, setIndex] = useState(0);

  const total = ONBOARDING_STEPS.length + 1;
  const isSetup = index === ONBOARDING_STEPS.length;
  const step = ONBOARDING_STEPS[index];
  const tint = STEP_TINTS[index % STEP_TINTS.length];
  const finish = () => updatePreferences({ onboarded: true });

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas, paddingTop: insets.top + 8 }]}>
      <View style={styles.top}>
        <Txt size={15} weight={700} color={c.faint}>
          {toBanglaDigits(index + 1)} / {toBanglaDigits(total)}
        </Txt>
        {!isSetup ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="পরিচিতি বাদ দিন"
            onPress={() => setIndex(ONBOARDING_STEPS.length)}
            style={({ pressed }) => [styles.skip, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
            <Txt size={15} weight={700} color={c.muted}>
              বাদ দিন ›
            </Txt>
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!isSetup && step ? (
          <View style={styles.step}>
            <View
              style={[
                styles.hero,
                {
                  backgroundColor: highContrast ? '#fff' : tint.bg,
                  borderColor: highContrast ? '#000' : tint.border,
                  boxShadow: highContrast ? undefined : shadows.card,
                },
              ]}>
              {index === 0 ? <Logo size={84} /> : (
                <Txt size={58} scaled={false} leading={1.3} align="center">
                  {step.icon}
                </Txt>
              )}
            </View>
            <Txt size={29} weight={800} color={c.ink} align="center" accessibilityRole="header" leading={1.35}>
              {step.title}
            </Txt>
            <Txt font="en" size={11} weight={800} color={c.fainter} tracking={1.2} align="center">
              {step.en}
            </Txt>
            <Txt size={19} weight={600} color={c.muted} align="center" leading={1.6}>
              {step.body}
            </Txt>
            {step.example ? (
              <View style={[styles.example, { backgroundColor: c.surface, borderColor: c.candBorder }]}>
                <Txt size={23} weight={600} color={c.body} align="center">
                  {step.example}
                </Txt>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.setup}>
            <View style={styles.setupHead}>
              <Logo size={56} />
              <Txt size={27} weight={800} color={c.ink} align="center" accessibilityRole="header">
                সহজ ব্যবহার
              </Txt>
              <Txt size={17} weight={600} color={c.muted} align="center">
                নিজের জন্য সুবিধামতো ঠিক করে নিন। পরে সেটিংস থেকেও বদলানো যাবে।
              </Txt>
            </View>
            <Section title="⏱️ ধরে রেখে বেছে নেওয়া" en="DWELL SELECTION" hint="ভুল চাপ এড়াতে বোতাম কিছুক্ষণ চেপে ধরে রাখতে হবে।">
              <DwellSelector value={preferences.dwellMs} onChange={(dwellMs) => updatePreferences({ dwellMs })} showTester />
            </Section>
            <Section title="লেখার আকার" en="TEXT SIZE">
              <OptionGroup<TextScale>
                accessibilityLabel="লেখার আকার"
                value={preferences.textScale}
                onChange={(textScale) => updatePreferences({ textScale })}
                options={[
                  { value: 1, label: 'স্বাভাবিক', sub: 'NORMAL' },
                  { value: 1.15, label: 'বড়', sub: 'LARGE' },
                  { value: 1.3, label: 'আরো বড়', sub: 'LARGER' },
                ]}
              />
            </Section>
          </View>
        )}
      </ScrollView>

      <View style={styles.dots} accessible={false}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { width: i === index ? 26 : 9, backgroundColor: i === index ? (highContrast ? '#000' : c.dwellTrack) : c.line },
            ]}
          />
        ))}
      </View>

      <View style={[styles.buttons, { paddingBottom: insets.bottom + 16 }]}>
        {index > 0 ? (
          <ActionButton icon="←" label="আগে" sublabel="BACK" onPress={() => setIndex((i) => i - 1)} style={styles.back} />
        ) : null}
        <ActionButton
          icon={isSetup ? '✓' : '→'}
          label={isSetup ? 'শুরু করুন' : 'পরবর্তী'}
          sublabel={isSetup ? "LET'S START" : 'NEXT'}
          variant="speak"
          size="lg"
          onPress={() => (isSetup ? finish() : setIndex((i) => i + 1))}
          style={styles.next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, minHeight: 52 },
  skip: { minHeight: 48, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5, justifyContent: 'center' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  step: { alignItems: 'center', gap: 10, maxWidth: 560, alignSelf: 'center' },
  hero: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  example: { marginTop: 10, borderWidth: 2, borderRadius: radius.xl, paddingHorizontal: 20, paddingVertical: 12 },
  setup: { maxWidth: 560, width: '100%', alignSelf: 'center' },
  setupHead: { alignItems: 'center', gap: 8, marginBottom: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dot: { height: 9, borderRadius: 5 },
  buttons: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  back: { flex: 1 },
  next: { flex: 2 },
});
