import { ScrollView, StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { gradients, radius } from '@/theme';
import type { SuggestedPhrase } from '@/utils/predictions';

interface PredictionRowProps {
  phrases: SuggestedPhrase[];
  onPick: (text: string) => void;
}

/** "এখন হয়তো লাগবে" — quick phrases from history or starter phrases. */
export function PredictionRow({ phrases, onPick }: PredictionRowProps) {
  const { c, highContrast } = useTheme();
  if (!phrases.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.label}>
        <Txt size={14} weight={700} color={c.muted}>
          এখন হয়তো লাগবে
        </Txt>
        <Txt font="en" size={10} weight={700} color={c.fainter} tracking={0.4}>
          · YOU MIGHT NEED
        </Txt>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {phrases.map((p) => (
          <DwellPressable
            key={p.text}
            onActivate={() => onPick(p.text)}
            accessibilityLabel={`${p.text}${p.fromHistory ? ', আগে ব্যবহার করা' : ''}`}
            accessibilityHint="বাক্যটি বড় করে দেখান"
            progressColor={c.predFg}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: c.predBg,
                experimental_backgroundImage: highContrast ? undefined : gradients.prediction,
                borderColor: c.predBorder,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}>
            <Txt size={16} weight={700} color={c.predFg} numberOfLines={2} leading={1.4}>
              {p.fromHistory ? '🕘 ' : '✨ '}
              {p.text}
            </Txt>
            {p.en ? (
              <Txt font="en" size={10.5} weight={700} color={c.predSub} numberOfLines={1}>
                {p.en}
              </Txt>
            ) : null}
          </DwellPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 6 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 6 },
  scroll: { paddingHorizontal: 16, gap: 9, paddingBottom: 4 },
  card: {
    minHeight: 60,
    maxWidth: 250,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    boxShadow: '0px 3px 9px -4px rgba(120,90,200,0.35)',
  },
});
