import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Txt } from '@/components/ui/Txt';
import { CATEGORIES } from '@/data/categories';
import { useTheme } from '@/hooks/useTheme';
import { fontFamilies, radius } from '@/theme';
import type { CategoryId, SymbolItem } from '@/types';

export interface SymbolEditorValues {
  label: string;
  en: string;
  icon: string;
  category: CategoryId;
  keywords: string[];
}

interface SymbolEditorProps {
  visible: boolean;
  /** `null` to create a new symbol. */
  symbol: SymbolItem | null;
  onClose: () => void;
  onSave: (values: SymbolEditorValues) => void;
  onDelete?: () => void;
  onReset?: () => void;
}

/**
 * Lightweight editor for educators / SLPs. Mount with a `key` so the form
 * resets when a different symbol is opened.
 */
export function SymbolEditor({ visible, symbol, onClose, onSave, onDelete, onReset }: SymbolEditorProps) {
  const { c, fs, tile } = useTheme();
  const [label, setLabel] = useState(symbol?.label ?? '');
  const [en, setEn] = useState(symbol?.en ?? '');
  const [icon, setIcon] = useState(symbol?.icon ?? '⭐');
  const [category, setCategory] = useState<CategoryId>(symbol?.category ?? 'needs');
  const [keywords, setKeywords] = useState((symbol?.keywords ?? []).join(', '));
  const isNew = !symbol;
  const t = tile(category);

  const inputStyle = [
    styles.input,
    { fontFamily: fontFamilies.bn[600], fontSize: fs(17), color: c.ink, borderColor: c.line, backgroundColor: c.surface },
  ];

  const field = (title: string, en: string, node: React.ReactNode) => (
    <View style={styles.field}>
      <View style={styles.fieldHead}>
        <Txt size={15} weight={700} color={c.inkSoft}>
          {title}
        </Txt>
        <Txt font="en" size={10} weight={700} color={c.fainter}>
          {en}
        </Txt>
      </View>
      {node}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isNew ? 'নতুন প্রতীক' : 'প্রতীক এডিট'}
      subtitle={isNew ? 'ADD A SYMBOL' : `EDIT SYMBOL${symbol?.custom ? ' · CUSTOM' : ''}`}>
      <View style={styles.previewRow}>
        <View style={[styles.preview, { backgroundColor: t.bg, borderColor: t.border }]}>
          <Txt size={34} scaled={false} leading={1.25}>
            {icon || '⭐'}
          </Txt>
          <Txt size={15} weight={600} color={t.fg} numberOfLines={1}>
            {label || 'নাম'}
          </Txt>
        </View>
        <Txt size={13} weight={600} color={c.muted} style={styles.flex}>
          এখন ছবির জায়গায় ইমোজি ব্যবহার হচ্ছে। লাইসেন্স করা AAC ছবি পরে যোগ করা যাবে।
        </Txt>
      </View>

      {field(
        'বাংলা নাম *',
        'BANGLA LABEL',
        <TextInput value={label} onChangeText={setLabel} placeholder="যেমন: পিঠা" placeholderTextColor={c.placeholder} accessibilityLabel="বাংলা নাম" style={inputStyle} />,
      )}
      {field(
        'ইংরেজি নাম',
        'ENGLISH GLOSS',
        <TextInput value={en} onChangeText={setEn} placeholder="e.g. Pitha" placeholderTextColor={c.placeholder} accessibilityLabel="ইংরেজি নাম" style={inputStyle} />,
      )}
      {field(
        'ইমোজি / আইকন',
        'ICON',
        <TextInput value={icon} onChangeText={(v) => setIcon(Array.from(v).slice(0, 4).join(''))} accessibilityLabel="ইমোজি" style={inputStyle} />,
      )}
      {field(
        'বিভাগ',
        'CATEGORY',
        <OptionGroup
          options={CATEGORIES.map((cat) => ({ value: cat.id, label: cat.label, icon: cat.icon }))}
          value={category}
          onChange={setCategory}
          accessibilityLabel="বিভাগ"
          columns={3}
        />,
      )}
      {field(
        'মিলে যাওয়া শব্দ',
        'KEYWORDS, COMMA SEPARATED',
        <TextInput
          value={keywords}
          onChangeText={setKeywords}
          placeholder="যেমন: ভাপা পিঠা, চিতই"
          placeholderTextColor={c.placeholder}
          accessibilityLabel="মিলে যাওয়া শব্দ, কমা দিয়ে আলাদা"
          style={inputStyle}
        />,
      )}

      {!isNew && !symbol?.custom ? (
        <Txt size={13} weight={600} color={c.warnFg} style={styles.note}>
          ⚠ নাম বদলালে নমুনা AI এই প্রতীকের জন্য সাধারণ নিয়মে বাক্য বানাবে — বাক্যটি যাচাই করে নিতে বলবে।
        </Txt>
      ) : null}

      <View style={styles.buttons}>
        <ActionButton
          icon="✓"
          label="সংরক্ষণ"
          sublabel="SAVE"
          variant="speak"
          disabled={!label.trim()}
          onPress={() =>
            onSave({
              label: label.trim(),
              en: en.trim(),
              icon: icon.trim() || '⭐',
              category,
              keywords: keywords
                .split(/[,،]/)
                .map((k) => k.trim())
                .filter(Boolean),
            })
          }
        />
        {onReset ? <ActionButton icon="↺" label="আগের মতো করুন" sublabel="RESET TO DEFAULT" onPress={onReset} /> : null}
        {onDelete ? <ActionButton icon="🗑️" label="মুছে ফেলুন" sublabel="DELETE" variant="danger" onPress={onDelete} /> : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  preview: { width: 96, height: 96, borderRadius: radius.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  field: { marginBottom: 12, gap: 6 },
  fieldHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  input: { minHeight: 54, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  note: { marginBottom: 12 },
  buttons: { gap: 10, marginTop: 4 },
});
