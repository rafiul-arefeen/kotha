import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryFilter } from '@/components/CategoryFilter';
import { SymbolEditor } from '@/components/SymbolEditor';
import { ActionButton } from '@/components/ui/ActionButton';
import { IconButton } from '@/components/ui/IconButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/state/ToastContext';
import { useVocabulary } from '@/state/VocabularyContext';
import { radius } from '@/theme';
import type { CategoryFilterId, SymbolItem } from '@/types';
import { toBanglaDigits } from '@/utils/bangla';
import { confirmAction } from '@/utils/confirm';

/** Lightweight vocabulary management for educators / SLPs. */
export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const { c, tile, highContrast } = useTheme();
  const toast = useToast();
  const { symbols, updateSymbol, addSymbol, deleteCustomSymbol, resetSymbol, resetVocabulary, isEdited } = useVocabulary();
  const [category, setCategory] = useState<CategoryFilterId>('all');
  const [editor, setEditor] = useState<{ symbol: SymbolItem | null; key: number } | null>(null);

  const list = category === 'all' ? symbols : symbols.filter((s) => s.category === category);
  const enabledCount = symbols.filter((s) => s.enabled).length;

  const open = (symbol: SymbolItem | null) => setEditor({ symbol, key: Date.now() });
  const editing = editor?.symbol ?? null;

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas, paddingTop: insets.top }]}>
      <ScreenHeader
        title="শব্দভান্ডার"
        subtitle="VOCABULARY · FOR EDUCATORS & SLPs"
        right={<IconButton icon="＋" label="নতুন প্রতীক যোগ করুন" onPress={() => open(null)} tone="plain" />}
      />
      <CategoryFilter value={category} onChange={setCategory} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Txt size={14} weight={700} color={c.muted} style={styles.count}>
          মোট {toBanglaDigits(symbols.length)}টি প্রতীক · চালু {toBanglaDigits(enabledCount)}টি
        </Txt>

        {list.map((symbol) => {
          const t = tile(symbol.category);
          const edited = !symbol.custom && isEdited(symbol.id);
          return (
            <View
              key={symbol.id}
              style={[styles.row, { backgroundColor: c.surface, borderColor: c.lineSoft, opacity: symbol.enabled ? 1 : 0.7 }]}>
              <View style={[styles.preview, { backgroundColor: t.bg, borderColor: t.border }]}>
                <Txt size={28} scaled={false} leading={1.25}>
                  {symbol.icon}
                </Txt>
              </View>
              <View style={styles.info}>
                <Txt size={17} weight={700} color={c.inkSoft} numberOfLines={1} leading={1.35}>
                  {symbol.label}
                </Txt>
                <Txt font="en" size={11} weight={700} color={c.faint} numberOfLines={1}>
                  {symbol.en}
                </Txt>
                {symbol.keywords?.length ? (
                  <Txt size={12} weight={600} color={c.faint} numberOfLines={1}>
                    {symbol.keywords.join(', ')}
                  </Txt>
                ) : null}
                <View style={styles.badges}>
                  {symbol.custom ? <Badge text="নতুন" color={c.optFg} /> : null}
                  {edited ? <Badge text="সম্পাদিত" color={c.favFg} /> : null}
                  {!symbol.enabled ? <Badge text="লুকানো" color={c.dangerFg} /> : null}
                </View>
              </View>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: symbol.enabled }}
                accessibilityLabel={`${symbol.label} দেখানো`}
                onPress={() => updateSymbol(symbol.id, { enabled: !symbol.enabled })}
                style={({ pressed }) => [
                  styles.switch,
                  {
                    backgroundColor: symbol.enabled ? (highContrast ? '#000' : c.optBg) : c.surfaceWarm,
                    borderColor: symbol.enabled ? (highContrast ? '#000' : c.optBorder) : c.line,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}>
                <Txt size={14} weight={800} color={symbol.enabled ? (highContrast ? '#fff' : c.optFg) : c.muted}>
                  {symbol.enabled ? '✓ চালু' : 'বন্ধ'}
                </Txt>
              </Pressable>
              <IconButton icon="✎" label={`${symbol.label} এডিট করুন`} onPress={() => open(symbol)} tone="warm" />
            </View>
          );
        })}

        <View style={styles.footer}>
          <ActionButton icon="＋" label="নতুন প্রতীক যোগ করুন" sublabel="ADD SYMBOL" variant="speak" onPress={() => open(null)} />
          <ActionButton
            icon="↺"
            label="সব আগের মতো করুন"
            sublabel="RESET VOCABULARY"
            variant="danger"
            onPress={() =>
              confirmAction('শব্দভান্ডার আগের মতো করবেন?', 'সব এডিট ও নতুন প্রতীক মুছে যাবে।', 'হ্যাঁ', () => {
                resetVocabulary();
                toast.show('শব্দভান্ডার আগের মতো করা হয়েছে');
              })
            }
          />
        </View>
      </ScrollView>

      {editor ? (
        <SymbolEditor
          key={editor.key}
          visible
          symbol={editing}
          onClose={() => setEditor(null)}
          onSave={(values) => {
            if (editing) updateSymbol(editing.id, values);
            else addSymbol(values);
            setEditor(null);
            toast.show(editing ? '✓ পরিবর্তন সংরক্ষণ হয়েছে' : '✓ নতুন প্রতীক যোগ হয়েছে');
          }}
          onReset={
            editing && !editing.custom && isEdited(editing.id)
              ? () => {
                  resetSymbol(editing.id);
                  setEditor(null);
                }
              : undefined
          }
          onDelete={
            editing?.custom
              ? () =>
                  confirmAction('প্রতীকটি মুছবেন?', editing.label, 'মুছুন', () => {
                    deleteCustomSymbol(editing.id);
                    setEditor(null);
                  })
              : undefined
          }
        />
      ) : null}
    </View>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Txt size={11} weight={800} color={color} leading={1.35}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 8 },
  count: { marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: radius.lg, padding: 10 },
  preview: { width: 58, height: 58, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  badges: { flexDirection: 'row', gap: 4, marginTop: 2 },
  badge: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 7 },
  switch: { minWidth: 72, minHeight: 48, borderWidth: 2, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  footer: { gap: 10, marginTop: 16 },
});
