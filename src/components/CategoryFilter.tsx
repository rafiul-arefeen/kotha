import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { CATEGORIES } from '@/data/categories';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { CategoryFilterId } from '@/types';

interface CategoryFilterProps {
  value: CategoryFilterId;
  onChange: (id: CategoryFilterId) => void;
  showFrequent?: boolean;
}

export function CategoryFilter({ value, onChange, showFrequent = false }: CategoryFilterProps) {
  const { c, tile, highContrast } = useTheme();

  const chips: { id: CategoryFilterId; label: string; icon: string }[] = [
    { id: 'all', label: 'সব', icon: '🔠' },
    ...(showFrequent ? [{ id: 'frequent' as const, label: 'ঘনঘন', icon: '⭐' }] : []),
    ...CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label, icon: cat.icon })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      accessibilityRole="tablist">
      {chips.map((chip) => {
        const active = chip.id === value;
        let colors: { bg: string; fg: string; border: string };
        if (chip.id === 'all') {
          colors = active
            ? { bg: highContrast ? '#000' : '#2c2823', fg: '#fff', border: highContrast ? '#000' : '#2c2823' }
            : { bg: c.surface, fg: c.muted, border: c.line };
        } else {
          const t = tile(chip.id);
          colors = active ? { bg: t.active, fg: '#fff', border: t.active } : { bg: t.bg, fg: t.fg, border: t.border };
        }
        return (
          <Pressable
            key={chip.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={chip.label}
            onPress={() => onChange(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: active ? 2 : 1.5,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}>
            <Txt size={14.5} weight={active ? 800 : 700} color={colors.fg} leading={1.3} numberOfLines={1}>
              {active ? '✓ ' : ''}
              {chip.icon} {chip.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: radius.pill,
  },
});
