import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { useTheme } from '@/hooks/useTheme';
import { TOUCH } from '@/theme';

import { Txt } from './Txt';

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  tone?: 'plain' | 'warm' | 'danger';
  size?: number;
  /** Small caption under the icon, e.g. "দেখাও". */
  caption?: string;
  dwell?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'plain',
  size = TOUCH,
  caption,
  dwell = false,
  disabled,
  style,
}: IconButtonProps) {
  const { c } = useTheme();
  const tones = {
    plain: { bg: c.surface, border: c.line },
    warm: { bg: c.surfaceWarm, border: c.lineSoft },
    danger: { bg: c.dangerBg, border: c.dangerLine },
  } as const;
  const t = tones[tone];

  return (
    <DwellPressable
      accessibilityLabel={label}
      onActivate={onPress}
      dwell={dwell}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          minWidth: size,
          height: caption ? size + 12 : size,
          backgroundColor: t.bg,
          borderColor: t.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        style,
      ]}>
      {typeof icon === 'string' ? (
        <Txt size={20} scaled={false} leading={1.2} color={c.muted}>
          {icon}
        </Txt>
      ) : (
        icon
      )}
      {caption ? (
        <Txt size={11} weight={800} color={c.muted} leading={1.2}>
          {caption}
        </Txt>
      ) : null}
    </DwellPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
});
