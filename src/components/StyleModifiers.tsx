import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { GenerationStyle } from '@/types';

const MODIFIERS: { id: Exclude<GenerationStyle, 'auto'>; bn: string; en: string }[] = [
  { id: 'shorter', bn: 'ছোট করো', en: 'SHORTER' },
  { id: 'politer', bn: 'আরো বিনয়ী', en: 'POLITER' },
  { id: 'simpler', bn: 'সহজ করো', en: 'SIMPLER' },
];

interface StyleModifiersProps {
  active: GenerationStyle;
  onStyle: (style: GenerationStyle) => void;
  onRegenerate: () => void;
  disabled: boolean;
}

export function StyleModifiers({ active, onStyle, onRegenerate, disabled }: StyleModifiersProps) {
  const { c, highContrast } = useTheme();

  const chip = (key: string, bn: string, en: string, selected: boolean, onPress: () => void, label: string) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.modActive : c.surface,
          borderColor: selected ? c.modActive : highContrast ? '#000' : c.modBorder,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}>
      <Txt size={15} weight={800} color={selected ? '#fff' : c.modFg} leading={1.3}>
        {selected ? '✓ ' : ''}
        {bn}
      </Txt>
      <Txt font="en" size={9} weight={700} color={selected ? '#fff' : c.modFg} style={styles.en}>
        {en}
      </Txt>
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {MODIFIERS.map((m) =>
        chip(m.id, m.bn, m.en, active === m.id, () => onStyle(active === m.id ? 'auto' : m.id), m.bn),
      )}
      {chip('regen', '⟲ আবার', 'AGAIN', false, onRegenerate, 'অন্যভাবে আবার বানান')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexGrow: 1,
    minWidth: 92,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  en: { opacity: 0.75 },
});
