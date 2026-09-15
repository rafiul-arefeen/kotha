import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

import { Txt } from './Txt';

interface SectionProps {
  title: string;
  en?: string;
  hint?: string;
  children: ReactNode;
}

export function Section({ title, en, hint, children }: SectionProps) {
  const { c } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Txt size={17} weight={800} color={c.inkSoft} accessibilityRole="header">
          {title}
        </Txt>
        {en ? (
          <Txt font="en" size={10.5} weight={700} color={c.fainter} tracking={0.5}>
            {en}
          </Txt>
        ) : null}
      </View>
      {hint ? (
        <Txt size={14} weight={500} color={c.muted} style={styles.hint}>
          {hint}
        </Txt>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  hint: { marginTop: 2 },
  body: { marginTop: 10, gap: 10 },
});
