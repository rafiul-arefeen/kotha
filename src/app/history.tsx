import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhraseHistory } from '@/components/PhraseHistory';
import { IconButton } from '@/components/ui/IconButton';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Txt } from '@/components/ui/Txt';
import { useMessageActions } from '@/hooks/useMessageActions';
import { useTheme } from '@/hooks/useTheme';
import { useHistory } from '@/state/HistoryContext';
import type { HistoryEntry } from '@/types';
import { confirmAction } from '@/utils/confirm';

type Filter = 'recent' | 'favorites' | 'frequent';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { entries, toggleFavorite, remove, clear } = useHistory();
  const { displayMessage, speakMessage } = useMessageActions();
  const [filter, setFilter] = useState<Filter>('recent');

  const list =
    filter === 'favorites'
      ? entries.filter((e) => e.favorite)
      : filter === 'frequent'
        ? [...entries].sort((a, b) => b.useCount - a.useCount || b.lastUsedAt - a.lastUsedAt)
        : [...entries].sort((a, b) => b.lastUsedAt - a.lastUsedAt);

  const asMessage = (entry: HistoryEntry) => ({
    text: entry.text,
    origin: 'history' as const,
    register: entry.register,
    inputs: entry.inputs,
  });

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas, paddingTop: insets.top }]}>
      <ScreenHeader
        title="ইতিহাস"
        subtitle="HISTORY · SAVED ONLY ON THIS PHONE"
        right={
          <IconButton
            icon="🗑️"
            label="ইতিহাস মুছুন"
            tone="danger"
            disabled={entries.length === 0}
            onPress={() =>
              confirmAction('ইতিহাস মুছবেন?', 'প্রিয় বাক্যগুলো থেকে যাবে।', 'হ্যাঁ, মুছুন', () => clear(false))
            }
          />
        }
      />
      <View style={styles.filters}>
        <OptionGroup<Filter>
          accessibilityLabel="কোন বাক্য দেখাবে"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'recent', label: 'সাম্প্রতিক', sub: 'RECENT' },
            { value: 'favorites', label: 'প্রিয়', sub: 'FAVOURITES' },
            { value: 'frequent', label: 'বেশি ব্যবহৃত', sub: 'MOST USED' },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <PhraseHistory
          entries={list}
          emptyText={
            filter === 'favorites'
              ? 'এখনো কোনো প্রিয় বাক্য নেই। বার্তা দেখানোর সময় ♡ চাপুন।'
              : 'এখনো কোনো বাক্য বলা বা দেখানো হয়নি।'
          }
          onReuse={(entry) => displayMessage(asMessage(entry))}
          onSpeak={(entry) => speakMessage(asMessage(entry))}
          onToggleFavorite={(entry) => toggleFavorite(entry.id)}
          onDelete={(entry) => confirmAction('বাক্যটি মুছবেন?', entry.text, 'মুছুন', () => remove(entry.id))}
        />
        {list.length > 0 ? (
          <Txt size={13} weight={600} color={c.faint} align="center" style={styles.note}>
            বাক্যে চাপ দিলে বড় করে দেখাবে। সব তথ্য শুধু এই ফোনে থাকে।
          </Txt>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  filters: { paddingHorizontal: 16, paddingBottom: 10 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  note: { marginTop: 16 },
});
