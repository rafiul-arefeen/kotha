import { ScrollView, StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { IconButton } from '@/components/ui/IconButton';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { ComposerItem } from '@/types';

interface SelectedItemsProps {
  items: ComposerItem[];
  onRemove: (key: string) => void;
  onUndo: () => void;
  onClear: () => void;
}

/** The sentence builder strip: chosen symbols/keywords, each removable. */
export function SelectedItems({ items, onRemove, onUndo, onClear }: SelectedItemsProps) {
  const { c, tile, highContrast } = useTheme();
  const empty = items.length === 0;

  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.chips}
        accessibilityLabel="বেছে নেওয়া শব্দ">
        {empty ? (
          <Txt size={15} weight={600} color={c.placeholder} numberOfLines={2}>
            প্রতীক বেছে নিন বা শব্দ লিখুন
          </Txt>
        ) : (
          items.map((item) => {
            const isSymbol = item.type === 'symbol';
            const colors = isSymbol ? tile(item.category) : { bg: c.surface, fg: c.inkSoft, border: c.line, active: c.ink };
            const label = isSymbol ? item.label : item.text;
            return (
              <DwellPressable
                key={item.key}
                onActivate={() => onRemove(item.key)}
                accessibilityLabel={`${label}, সরাতে চাপুন`}
                progressColor={colors.fg}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: colors.bg,
                    borderColor: highContrast ? '#000' : colors.border,
                    borderStyle: isSymbol ? 'solid' : 'dashed',
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}>
                <Txt size={17} weight={600} color={colors.fg} leading={1.35} numberOfLines={1}>
                  {isSymbol ? item.icon : '✍️'} {label}
                </Txt>
                <Txt size={13} weight={800} color={colors.fg} scaled={false} style={styles.remove}>
                  ✕
                </Txt>
              </DwellPressable>
            );
          })
        )}
      </ScrollView>
      <IconButton icon="↶" label="শেষেরটি সরান" onPress={onUndo} tone="warm" disabled={empty} />
      <IconButton icon="🗑️" label="সব মুছুন" onPress={onClear} tone="danger" disabled={empty} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  scroll: { flex: 1 },
  chips: { alignItems: 'center', gap: 7, minHeight: 50 },
  chip: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  remove: { opacity: 0.6 },
});
