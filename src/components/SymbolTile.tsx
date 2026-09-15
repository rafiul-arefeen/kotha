import { StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { radius, shadows } from '@/theme';
import type { SymbolItem } from '@/types';
import { toBanglaDigits } from '@/utils/bangla';

interface SymbolTileProps {
  symbol: SymbolItem;
  width: number;
  height: number;
  /** How many times this symbol is in the current selection. */
  count: number;
  showEnglish: boolean;
  onSelect: (symbol: SymbolItem) => void;
}

export function SymbolTile({ symbol, width, height, count, showEnglish, onSelect }: SymbolTileProps) {
  const { tile, highContrast } = useTheme();
  const t = tile(symbol.category);
  const selected = count > 0;
  const emojiSize = Math.max(26, Math.min(64, Math.round(width * 0.33)));
  const labelSize = width < 92 ? 14 : width < 130 ? 16 : 19;

  return (
    <DwellPressable
      onActivate={() => onSelect(symbol)}
      accessibilityLabel={`${symbol.label}${selected ? `, ${toBanglaDigits(count)} বার বেছে নেওয়া হয়েছে` : ''}`}
      accessibilityHint="বাক্যে যোগ করুন"
      progressColor={highContrast ? '#000' : t.active}
      style={({ pressed }) => [
        styles.tile,
        {
          width,
          height,
          backgroundColor: t.bg,
          borderColor: selected ? (highContrast ? '#000' : t.active) : t.border,
          borderWidth: selected ? 3.5 : 2,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}>
      <Txt size={emojiSize} scaled={false} leading={1.25} accessible={false}>
        {symbol.icon}
      </Txt>
      <Txt
        size={labelSize}
        weight={600}
        color={t.fg}
        align="center"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        leading={1.25}>
        {symbol.label}
      </Txt>
      {showEnglish && width >= 84 ? (
        <Txt font="en" size={10} weight={700} color={t.fg} scaled={false} numberOfLines={1} style={styles.en}>
          {symbol.en}
        </Txt>
      ) : null}
      {selected ? (
        <View style={[styles.badge, { backgroundColor: highContrast ? '#000' : t.active }]}>
          <Txt size={12} weight={800} color="#fff" scaled={false} leading={1.3}>
            ✓{count > 1 ? toBanglaDigits(count) : ''}
          </Txt>
        </View>
      ) : null}
    </DwellPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    boxShadow: shadows.tile,
  },
  en: { opacity: 0.65 },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
