import { StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { IconButton } from '@/components/ui/IconButton';
import { Txt } from '@/components/ui/Txt';
import { REGISTER_BY_ID } from '@/data/registers';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { HistoryEntry } from '@/types';
import { relativeTimeBn, toBanglaDigits } from '@/utils/bangla';

interface PhraseHistoryProps {
  entries: HistoryEntry[];
  onReuse: (entry: HistoryEntry) => void;
  onSpeak: (entry: HistoryEntry) => void;
  onToggleFavorite: (entry: HistoryEntry) => void;
  onDelete: (entry: HistoryEntry) => void;
  emptyText: string;
}

export function PhraseHistory({ entries, onReuse, onSpeak, onToggleFavorite, onDelete, emptyText }: PhraseHistoryProps) {
  const { c, register: registerTone } = useTheme();

  if (!entries.length) {
    return (
      <View style={styles.empty}>
        <Txt size={40} scaled={false} align="center">
          🗒️
        </Txt>
        <Txt size={17} weight={700} color={c.faint} align="center">
          {emptyText}
        </Txt>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {entries.map((entry) => {
        const register = entry.register ? REGISTER_BY_ID[entry.register] : null;
        const tone = register ? registerTone(register.id) : null;
        return (
          <View key={entry.id} style={[styles.card, { backgroundColor: c.surface, borderColor: c.lineSoft }]}>
            <DwellPressable
              onActivate={() => onReuse(entry)}
              accessibilityLabel={`${entry.text}। আবার ব্যবহার করুন`}
              progressColor={c.ink}
              style={({ pressed }) => [styles.textArea, { opacity: pressed ? 0.8 : 1 }]}>
              <Txt size={21} weight={600} color={c.body} leading={1.5}>
                {entry.favorite ? '♥ ' : ''}
                {entry.text}
              </Txt>
            </DwellPressable>
            <View style={styles.meta}>
              {register && tone ? (
                <View style={[styles.regChip, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                  <Txt size={12} weight={700} color={tone.fg} leading={1.35}>
                    {register.icon} {register.label.split(' / ')[0]}
                  </Txt>
                </View>
              ) : null}
              <Txt size={13} weight={600} color={c.faint}>
                {relativeTimeBn(entry.lastUsedAt)} · {toBanglaDigits(entry.useCount)} বার
              </Txt>
            </View>
            <View style={styles.actions}>
              <IconButton icon="🔊" caption="বলো" label={`বলো: ${entry.text}`} onPress={() => onSpeak(entry)} tone="warm" dwell style={styles.action} />
              <IconButton icon="👁️" caption="দেখাও" label={`দেখাও: ${entry.text}`} onPress={() => onReuse(entry)} tone="warm" dwell style={styles.action} />
              <IconButton
                icon={entry.favorite ? '♥' : '♡'}
                caption={entry.favorite ? 'প্রিয় ✓' : 'প্রিয়'}
                label={entry.favorite ? 'প্রিয় থেকে সরান' : 'প্রিয়তে রাখুন'}
                onPress={() => onToggleFavorite(entry)}
                tone="warm"
                style={styles.action}
              />
              <IconButton icon="🗑️" caption="মুছুন" label="এই বাক্যটি মুছুন" onPress={() => onDelete(entry)} tone="danger" style={styles.action} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  empty: { paddingVertical: 48, gap: 8 },
  card: { borderWidth: 1.5, borderRadius: radius.xl, padding: 14, gap: 8 },
  textArea: { minHeight: 48, justifyContent: 'center', borderRadius: radius.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  regChip: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 9 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1 },
});
