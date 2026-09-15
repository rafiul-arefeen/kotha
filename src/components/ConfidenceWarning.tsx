import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { describeWarning } from '@/data/messages';
import { PRONOUN_LABEL, REGISTER_BY_ID } from '@/data/registers';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { GenerationResult } from '@/types';

/**
 * Shows the register being used and any confidence warnings in plain Bangla.
 * Raw confidence levels are never shown to the user.
 */
export function ConfidenceWarning({ result }: { result: GenerationResult }) {
  const { c, highContrast } = useTheme();
  const register = REGISTER_BY_ID[result.register];

  const seenTitles = new Set<string>();
  const items = result.warnings.map((w) => {
    const text = describeWarning(w, result.register);
    const repeat = seenTitles.has(text.title);
    seenTitles.add(text.title);
    return { ...text, repeat, key: w.code };
  });

  const toneStyle = (tone: 'warn' | 'info') =>
    highContrast
      ? { backgroundColor: '#fff', borderColor: '#000', color: '#000' }
      : tone === 'warn'
        ? { backgroundColor: c.warnBg, borderColor: c.warnBorder, color: c.warnFg }
        : { backgroundColor: '#eaf2fb', borderColor: '#c3d7ee', color: '#23466b' };

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={[styles.registerLine, { borderColor: c.aiCardLine, backgroundColor: c.surface }]}>
        <Txt size={15} weight={700} color={c.aiMuted}>
          🗣️ {register.label}-কে বলছেন · &quot;{PRONOUN_LABEL[register.pronoun]}&quot; রূপে
        </Txt>
      </View>
      {items.map((w) => {
        const t = toneStyle(w.tone);
        return (
          <View
            key={w.key}
            accessible
            accessibilityRole={w.tone === 'warn' ? 'alert' : undefined}
            style={[styles.box, { backgroundColor: t.backgroundColor, borderColor: t.borderColor }]}>
            <Txt size={20} scaled={false} leading={1.3}>
              {w.icon}
            </Txt>
            <View style={styles.text}>
              {!w.repeat ? (
                <Txt size={16} weight={800} color={t.color} leading={1.4}>
                  {w.title}
                </Txt>
              ) : null}
              {w.detail ? (
                <Txt size={14} weight={600} color={t.color} leading={1.45}>
                  {w.detail}
                </Txt>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  registerLine: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 6 },
  box: { flexDirection: 'row', gap: 10, borderWidth: 1.5, borderRadius: radius.md, padding: 12 },
  text: { flex: 1, gap: 2 },
});
