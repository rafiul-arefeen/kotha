import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';

import { Txt } from './Txt';

interface ToggleRowProps {
  label: string;
  sublabel?: string;
  icon?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * Full-width toggle row. The whole row is the touch target and the state is
 * shown as text (চালু / বন্ধ) as well as colour.
 */
export function ToggleRow({ label, sublabel, icon, value, onChange }: ToggleRowProps) {
  const { c, highContrast } = useTheme();
  const on = value;
  const track = on ? (highContrast ? '#000' : c.dwellTrack) : highContrast ? '#fff' : '#d9d0c2';

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={() => onChange(!on)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: on && !highContrast ? '#dffaea' : c.surfaceWarm,
          borderColor: on && !highContrast ? '#90ceac' : c.lineSoft,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.text}>
        <Txt size={16} weight={700} color={c.inkSoft}>
          {icon ? `${icon}  ` : ''}
          {label}
        </Txt>
        {sublabel ? (
          <Txt font="en" size={11} weight={700} color={c.faint}>
            {sublabel}
          </Txt>
        ) : null}
      </View>
      <View style={styles.right}>
        <Txt size={14} weight={800} color={on ? c.optFg : c.muted}>
          {on ? 'চালু' : 'বন্ধ'}
        </Txt>
        <View style={[styles.track, { backgroundColor: track, borderColor: highContrast ? '#000' : 'transparent' }]}>
          <View
            style={[
              styles.knob,
              { alignSelf: on ? 'flex-end' : 'flex-start', backgroundColor: highContrast && on ? '#fff' : '#fff', borderColor: highContrast ? '#000' : 'transparent' },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  text: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { width: 58, height: 34, borderRadius: 999, padding: 4, borderWidth: 1.5, justifyContent: 'center' },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    boxShadow: '0px 2px 5px rgba(0,0,0,0.25)',
  },
});
