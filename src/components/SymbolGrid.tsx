import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { SymbolTile } from '@/components/SymbolTile';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { usePreferences } from '@/state/PreferencesContext';
import type { GridSize, SymbolItem } from '@/types';

const PADDING = 14;
const GAP = 10;

/** Columns grow on tablets so tiles stay a comfortable size. */
export function columnsFor(size: GridSize, width: number): number {
  const base = { large: 2, medium: 3, small: 4 }[size];
  const extra = width >= 900 ? 3 : width >= 600 ? 2 : 0;
  return base + extra;
}

interface SymbolGridProps {
  symbols: SymbolItem[];
  counts: Record<string, number>;
  onSelect: (symbol: SymbolItem) => void;
  emptyText?: string;
}

export function SymbolGrid({ symbols, counts, onSelect, emptyText }: SymbolGridProps) {
  const { width } = useWindowDimensions();
  const { preferences } = usePreferences();
  const { c } = useTheme();

  const cols = columnsFor(preferences.gridSize, width);
  const tileWidth = Math.floor((width - PADDING * 2 - GAP * (cols - 1)) / cols);
  const tileHeight = Math.round(tileWidth * (preferences.showEnglish ? 1 : 0.92) + (preferences.textScale - 1) * 40);

  if (!symbols.length) {
    return (
      <View style={styles.empty}>
        <Txt size={16} weight={600} color={c.faint} align="center">
          {emptyText ?? 'এখানে কোনো প্রতীক নেই।'}
        </Txt>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {symbols.map((symbol) => (
        <SymbolTile
          key={symbol.id}
          symbol={symbol}
          width={tileWidth}
          height={tileHeight}
          count={counts[symbol.id] ?? 0}
          showEnglish={preferences.showEnglish}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: PADDING, paddingTop: 4, paddingBottom: 12 },
  empty: { padding: 32 },
});
