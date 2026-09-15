import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { CategoryFilter } from '@/components/CategoryFilter';
import { GenerateButton } from '@/components/GenerateButton';
import { KeywordInput } from '@/components/KeywordInput';
import { PredictionRow } from '@/components/PredictionRow';
import { RegisterSelector } from '@/components/RegisterSelector';
import { SelectedItems } from '@/components/SelectedItems';
import { SymbolGrid } from '@/components/SymbolGrid';
import { ActionButton } from '@/components/ui/ActionButton';
import { IconButton } from '@/components/ui/IconButton';
import { useMessageActions } from '@/hooks/useMessageActions';
import { useTheme } from '@/hooks/useTheme';
import { useComposer } from '@/state/ComposerContext';
import { useHistory } from '@/state/HistoryContext';
import { usePreferences } from '@/state/PreferencesContext';
import { useToast } from '@/state/ToastContext';
import { useVocabulary } from '@/state/VocabularyContext';
import { radius, shadows } from '@/theme';
import type { CategoryFilterId, RegisterId, SymbolItem } from '@/types';
import { suggestPhrases } from '@/utils/predictions';

/** Main AAC communication screen. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const { symbols, symbolById, frequentIds } = useVocabulary();
  const { entries } = useHistory();
  const composer = useComposer();
  const toast = useToast();
  const { displayMessage } = useMessageActions();
  const [category, setCategory] = useState<CategoryFilterId>('all');
  const [registerSheet, setRegisterSheet] = useState({ open: false, thenGenerate: false });

  const enabled = symbols.filter((s) => s.enabled);
  const visible =
    category === 'all'
      ? enabled
      : category === 'frequent'
        ? frequentIds.map((id) => symbolById[id]).filter((s): s is SymbolItem => !!s && s.enabled)
        : enabled.filter((s) => s.category === category);

  const counts: Record<string, number> = {};
  for (const item of composer.items) {
    if (item.type === 'symbol') counts[item.symbolId] = (counts[item.symbolId] ?? 0) + 1;
  }

  const hasItems = composer.items.length > 0;

  const requireItems = () => {
    if (hasItems) return true;
    toast.show('আগে প্রতীক বেছে নিন বা শব্দ লিখুন');
    return false;
  };

  const onGenerate = () => {
    if (!requireItems()) return;
    if (!preferences.register) {
      setRegisterSheet({ open: true, thenGenerate: true });
      return;
    }
    router.push('/generate');
  };

  /** Speak/show the selected words exactly as they are, without AI. */
  const sendOwnWords = (autoSpeak: boolean) => {
    if (!requireItems()) return;
    displayMessage(
      {
        text: composer.inputLabels.join(' '),
        origin: 'own-words',
        register: preferences.register,
        inputs: composer.inputLabels,
      },
      { autoSpeak },
    );
  };

  const selectRegister = (id: RegisterId) => {
    updatePreferences({ register: id });
    const thenGenerate = registerSheet.thenGenerate;
    setRegisterSheet({ open: false, thenGenerate: false });
    if (thenGenerate) router.push('/generate');
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas, paddingTop: insets.top }]}>
      <AppHeader
        registerId={preferences.register}
        onOpenRegister={() => setRegisterSheet({ open: true, thenGenerate: false })}
        onOpenHistory={() => router.push('/history')}
        onOpenSettings={() => router.push('/settings')}
      />

      <ScrollView
        style={styles.flex}
        stickyHeaderIndices={[2]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <PredictionRow
          phrases={suggestPhrases(entries, preferences.register)}
          onPick={(text) =>
            displayMessage({ text, origin: 'history', register: preferences.register, inputs: [] })
          }
        />
        <KeywordInput onSubmit={composer.addKeywords} />
        <View style={{ backgroundColor: c.canvas }}>
          <CategoryFilter value={category} onChange={setCategory} showFrequent={frequentIds.length > 0} />
        </View>
        <SymbolGrid
          symbols={visible}
          counts={counts}
          onSelect={composer.addSymbol}
          emptyText={category === 'frequent' ? 'এখনো কোনো প্রতীক বেশি ব্যবহার হয়নি।' : 'এই বিভাগে কোনো চালু প্রতীক নেই।'}
        />
      </ScrollView>

      <View
        style={[
          styles.builder,
          { backgroundColor: c.surface, borderColor: c.lineWarm, paddingBottom: insets.bottom + 12, boxShadow: shadows.sheet },
        ]}>
        <SelectedItems
          items={composer.items}
          onRemove={composer.removeItem}
          onUndo={composer.undo}
          onClear={composer.clearItems}
        />
        <View style={styles.actions}>
          <GenerateButton onPress={onGenerate} style={styles.big} />
          <ActionButton
            icon="🔊"
            label="বলো"
            sublabel="SPEAK"
            variant="speak"
            onPress={() => sendOwnWords(true)}
            accessibilityLabel="বেছে নেওয়া শব্দগুলো যেমন আছে তেমন বলো"
            style={styles.big}
          />
          <IconButton
            icon="👁️"
            caption="দেখাও"
            label="বেছে নেওয়া শব্দ বড় করে দেখাও"
            onPress={() => sendOwnWords(false)}
            tone="warm"
            dwell
            style={styles.show}
          />
        </View>
      </View>

      <RegisterSelector
        visible={registerSheet.open}
        value={preferences.register}
        note={registerSheet.thenGenerate ? 'বাক্যটি কার জন্য, আগে বেছে নিন।' : undefined}
        onClose={() => setRegisterSheet({ open: false, thenGenerate: false })}
        onSelect={selectRegister}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  builder: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1.5,
    paddingHorizontal: 14,
    paddingTop: 11,
  },
  actions: { flexDirection: 'row', gap: 9, alignItems: 'stretch' },
  big: { flex: 1.5 },
  show: { minWidth: 64, height: 'auto', borderRadius: radius.lg },
});
