import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/state/ToastContext';
import { fontFamilies, radius, TOUCH } from '@/theme';

interface KeywordInputProps {
  /** Returns how many keywords were added. */
  onSubmit: (text: string) => number;
}

/** Type a few Bangla words; they join the selected symbols as chips. */
export function KeywordInput({ onSubmit }: KeywordInputProps) {
  const [value, setValue] = useState('');
  const { c, fs, highContrast } = useTheme();
  const toast = useToast();
  const hasText = value.trim().length > 0;

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    if (onSubmit(text) > 0) {
      toast.show(`✍️ যোগ হয়েছে: ${text}`);
      setValue('');
    }
  };

  return (
    <View style={styles.row}>
      <View style={[styles.field, { backgroundColor: c.surface, borderColor: highContrast ? '#000' : c.line }]}>
        <Txt size={18} scaled={false} leading={1.3} accessible={false}>
          ✍️
        </Txt>
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder="বাংলায় শব্দ লিখুন — যেমন: আম্মু, বাইরে"
          placeholderTextColor={c.placeholder}
          accessibilityLabel="বাংলা শব্দ লিখুন"
          accessibilityHint="লিখে যোগ বোতাম চাপুন। কমা দিয়ে একাধিক শব্দ দেওয়া যায়।"
          autoCorrect={false}
          autoCapitalize="none"
          style={[styles.input, { fontFamily: fontFamilies.bn[600], fontSize: fs(17), color: c.ink }]}
        />
        {hasText ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="লেখা মুছুন"
            onPress={() => setValue('')}
            hitSlop={6}
            style={styles.clear}>
            <Txt size={16} color={c.faint} scaled={false}>
              ✕
            </Txt>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="শব্দ যোগ করুন"
        accessibilityState={{ disabled: !hasText }}
        disabled={!hasText}
        onPress={submit}
        style={({ pressed }) => [
          styles.add,
          { backgroundColor: hasText ? c.ink : c.lineSoft, transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}>
        <Txt size={16} weight={800} color={hasText ? '#fff' : c.faint}>
          ＋ যোগ
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 6 },
  field: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  input: { flex: 1, minHeight: 52, paddingVertical: 6 },
  clear: { width: TOUCH - 4, height: 52, alignItems: 'center', justifyContent: 'center' },
  add: { minWidth: 76, minHeight: 54, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
