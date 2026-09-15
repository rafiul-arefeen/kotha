import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SpeakingBars } from '@/components/SpeakingBars';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { fontFamilies, radius, shadows } from '@/theme';

interface SentencePreviewProps {
  text: string;
  onChangeText: (text: string) => void;
  editing: boolean;
  onToggleEdit: () => void;
  loading: boolean;
  speaking: boolean;
  edited: boolean;
  styleLabel?: { bn: string; en: string };
  sourceLabel?: string;
}

/** The generated sentence, large and always editable. */
export function SentencePreview({
  text,
  onChangeText,
  editing,
  onToggleEdit,
  loading,
  speaking,
  edited,
  styleLabel,
  sourceLabel,
}: SentencePreviewProps) {
  const { c, fs, highContrast } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: editing ? c.modActive : c.candBorder, boxShadow: highContrast ? undefined : shadows.card },
      ]}>
      <View style={styles.top}>
        {styleLabel ? (
          <View style={[styles.pill, { backgroundColor: highContrast ? '#fff' : c.labelBg, borderColor: highContrast ? '#000' : 'transparent' }]}>
            <Txt size={13} weight={800} color={c.labelFg} leading={1.35}>
              {styleLabel.bn}
            </Txt>
          </View>
        ) : null}
        {styleLabel ? (
          <Txt font="en" size={9.5} weight={700} color={c.aiFaint} tracking={0.5} style={styles.flex} numberOfLines={1}>
            {styleLabel.en}
          </Txt>
        ) : (
          <View style={styles.flex} />
        )}
        {edited ? (
          <Txt size={12} weight={800} color={c.favFg}>
            ✎ আপনার এডিট
          </Txt>
        ) : sourceLabel ? (
          <Txt size={12} weight={800} color={c.labelFg}>
            {sourceLabel}
          </Txt>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={c.modActive} size="large" />
          <Txt size={17} weight={700} color={c.aiMuted}>
            বাক্য তৈরি হচ্ছে…
          </Txt>
        </View>
      ) : editing ? (
        <TextInput
          value={text}
          onChangeText={onChangeText}
          multiline
          autoFocus
          accessibilityLabel="বাক্যটি এডিট করুন"
          placeholder="এখানে নিজের বাক্য লিখুন…"
          placeholderTextColor={c.placeholder}
          style={[
            styles.input,
            {
              fontFamily: fontFamilies.bn[600],
              fontSize: fs(24),
              lineHeight: Math.round(fs(24) * 1.5),
              color: c.body,
              borderColor: c.modBorder,
              backgroundColor: highContrast ? '#fff' : c.aiCanvas,
            },
          ]}
        />
      ) : (
        <Txt
          size={26}
          weight={600}
          color={text ? c.body : c.placeholder}
          leading={1.55}
          accessibilityLiveRegion="polite"
          accessibilityLabel={text ? `প্রস্তাবিত বাক্য: ${text}` : 'কোনো বাক্য নেই'}>
          {text || 'এখনো কোনো বাক্য নেই — এডিট চেপে নিজে লিখুন।'}
        </Txt>
      )}

      <View style={styles.bottom}>
        <SpeakingBars active={speaking} />
        <View style={styles.flex} />
        {!loading ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={editing ? 'এডিট শেষ করুন' : 'বাক্যটি এডিট করুন'}
            onPress={onToggleEdit}
            style={({ pressed }) => [
              styles.editButton,
              {
                backgroundColor: editing ? (highContrast ? '#000' : c.modActive) : c.surface,
                borderColor: editing ? (highContrast ? '#000' : c.modActive) : c.modBorder,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}>
            <Txt size={15} weight={800} color={editing ? '#fff' : c.modFg}>
              {editing ? '✓ এডিট শেষ' : '✎ এডিট করুন'}
            </Txt>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 2, padding: 16, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1 },
  flex: { flex: 1 },
  loading: { minHeight: 110, alignItems: 'center', justifyContent: 'center', gap: 8 },
  input: { minHeight: 120, borderWidth: 2, borderRadius: radius.md, padding: 12, textAlignVertical: 'top' },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  editButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
