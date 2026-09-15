import { StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { Txt } from '@/components/ui/Txt';
import { STYLE_LABELS } from '@/data/messages';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { SentenceOption } from '@/types';

interface AlternativeListProps {
  options: SentenceOption[];
  onChoose: (option: SentenceOption) => void;
}

export function AlternativeList({ options, onChoose }: AlternativeListProps) {
  const { c, highContrast } = useTheme();
  if (!options.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Txt size={16} weight={800} color={c.aiInk}>
          অন্য বিকল্প
        </Txt>
        <Txt font="en" size={10} weight={700} color={c.aiFaint} tracking={0.5}>
          · TAP TO USE INSTEAD
        </Txt>
      </View>
      {options.map((option) => {
        const label = STYLE_LABELS[option.style];
        return (
          <DwellPressable
            key={option.text}
            onActivate={() => onChoose(option)}
            accessibilityLabel={`${label.bn}: ${option.text}`}
            accessibilityHint="এই বাক্যটি ব্যবহার করুন"
            progressColor={c.modActive}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: c.surface, borderColor: c.candBorder, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}>
            <View style={styles.cardTop}>
              <View style={[styles.pill, { backgroundColor: highContrast ? '#fff' : c.labelBg, borderColor: highContrast ? '#000' : 'transparent' }]}>
                <Txt size={12} weight={800} color={c.labelFg} leading={1.35}>
                  {label.bn}
                </Txt>
              </View>
              <Txt font="en" size={9} weight={700} color={c.aiFaint} tracking={0.5} style={styles.flex} numberOfLines={1}>
                {label.en}
              </Txt>
              <Txt size={13} weight={800} color={c.modFg}>
                ↑ এটি নিন
              </Txt>
            </View>
            <Txt size={20} weight={600} color={c.body} leading={1.5}>
              {option.text}
            </Txt>
          </DwellPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 9 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  card: { borderWidth: 2, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: { paddingHorizontal: 9, borderRadius: radius.pill, borderWidth: 1 },
  flex: { flex: 1 },
});
