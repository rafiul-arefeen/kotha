import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { useTheme } from '@/hooks/useTheme';
import { gradients, palette, radius, shadows } from '@/theme';

import { Txt } from './Txt';

export type ActionVariant = 'ai' | 'speak' | 'neutral' | 'danger' | 'fav';

interface ActionButtonProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  variant?: ActionVariant;
  size?: 'md' | 'lg';
  layout?: 'row' | 'column';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Primary actions (AI বাক্য, বলো, দেখাও…) with the mockup's gradient styling. */
export function ActionButton({
  icon,
  label,
  sublabel,
  onPress,
  variant = 'neutral',
  size = 'md',
  layout = 'row',
  loading,
  disabled,
  accessibilityLabel,
  style,
}: ActionButtonProps) {
  const { c, highContrast } = useTheme();
  const filled = variant === 'ai' || variant === 'speak';

  const look = (() => {
    if (highContrast) {
      return filled
        ? { bg: '#000', border: '#000', fg: '#fff', image: undefined, shadow: undefined }
        : { bg: '#fff', border: '#000', fg: '#000', image: undefined, shadow: undefined };
    }
    switch (variant) {
      case 'ai':
        return { bg: palette.aiB, border: 'transparent', fg: '#fff', image: gradients.ai, shadow: shadows.ai };
      case 'speak':
        return { bg: palette.speakB, border: 'transparent', fg: '#fff', image: gradients.speak, shadow: shadows.speak };
      case 'danger':
        return { bg: c.dangerBg, border: c.dangerLine, fg: c.dangerFg, image: undefined, shadow: undefined };
      case 'fav':
        return { bg: c.favBg, border: c.favLine, fg: c.favFg, image: undefined, shadow: undefined };
      default:
        return { bg: c.surfaceWarm, border: c.line, fg: c.muted, image: undefined, shadow: undefined };
    }
  })();

  const big = size === 'lg';

  return (
    <DwellPressable
      accessibilityLabel={accessibilityLabel ?? `${label}${sublabel ? `, ${sublabel}` : ''}`}
      onActivate={onPress}
      disabled={disabled || loading}
      progressColor={filled ? '#ffffff' : c.ink}
      style={({ pressed }) => [
        styles.base,
        layout === 'column' ? styles.column : styles.row,
        {
          minHeight: big ? 64 : 56,
          backgroundColor: look.bg,
          experimental_backgroundImage: look.image,
          borderColor: look.border,
          borderWidth: filled && !highContrast ? 0 : 1.5,
          boxShadow: look.shadow,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={look.fg} />
      ) : (
        <Txt size={big ? 24 : 20} scaled={false} leading={1.2}>
          {icon}
        </Txt>
      )}
      <View style={layout === 'column' ? styles.labelsCenter : styles.labels}>
        <Txt size={big ? 21 : 17} weight={800} color={look.fg} leading={1.25} numberOfLines={1}>
          {label}
        </Txt>
        {sublabel ? (
          <Txt font="en" size={10} weight={800} color={look.fg} tracking={0.5} style={styles.sub} numberOfLines={1}>
            {sublabel}
          </Txt>
        ) : null}
      </View>
    </DwellPressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  column: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 },
  labels: { alignItems: 'flex-start', flexShrink: 1 },
  labelsCenter: { alignItems: 'center' },
  sub: { opacity: 0.85 },
});
