import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';

import { Txt } from './Txt';

export interface Option<T> {
  value: T;
  label: string;
  sub?: string;
  icon?: string;
}

interface OptionGroupProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  columns?: number;
}

/** Large, single-choice buttons (radio group). Selection shown by ✓, border and fill. */
export function OptionGroup<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
  columns,
}: OptionGroupProps<T>) {
  const { c, highContrast } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${o.label}${o.sub ? `, ${o.sub}` : ''}`}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [
              styles.option,
              columns ? { flexBasis: `${100 / columns - 3}%` } : null,
              {
                backgroundColor: selected ? (highContrast ? '#000' : c.optBg) : c.surfaceWarm,
                borderColor: selected ? (highContrast ? '#000' : c.optBorder) : c.lineSoft,
                borderWidth: selected ? 2.5 : 1.5,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}>
            {selected ? (
              <View style={[styles.check, { backgroundColor: highContrast ? '#fff' : c.optFg }]}>
                <Txt size={11} weight={800} scaled={false} leading={1.2} color={highContrast ? '#000' : '#fff'}>
                  ✓
                </Txt>
              </View>
            ) : null}
            {o.icon ? (
              <Txt size={20} scaled={false} leading={1.25}>
                {o.icon}
              </Txt>
            ) : null}
            <Txt size={15} weight={700} align="center" color={selected ? (highContrast ? '#fff' : c.optFg) : c.muted} leading={1.35}>
              {o.label}
            </Txt>
            {o.sub ? (
              <Txt font="en" size={10} weight={700} align="center" color={selected ? (highContrast ? '#ddd' : c.optFg) : c.faint}>
                {o.sub}
              </Txt>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 72,
    minHeight: 60,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
