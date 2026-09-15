import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { fontFamilies, type FontWeight } from '@/theme';

export interface TxtProps extends TextProps {
  size?: number;
  weight?: FontWeight;
  /** 'bn' = Baloo Da 2 (Bangla + Latin), 'en' = Nunito for small English labels. */
  font?: 'bn' | 'en';
  color?: string;
  align?: TextStyle['textAlign'];
  tracking?: number;
  /** Line height as a multiple of font size. Bangla needs room for matras. */
  leading?: number;
  /** Apply the user's text-size preference (default true). */
  scaled?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Txt({
  size = 16,
  weight = 600,
  font = 'bn',
  color,
  align,
  tracking,
  leading,
  scaled = true,
  style,
  ...rest
}: TxtProps) {
  const { c, fs } = useTheme();
  const fontSize = scaled ? fs(size) : size;
  const ratio = leading ?? (font === 'bn' ? 1.5 : 1.3);
  return (
    <Text
      maxFontSizeMultiplier={1.5}
      {...rest}
      style={[
        {
          fontFamily: fontFamilies[font][weight],
          fontSize,
          lineHeight: Math.round(fontSize * ratio),
          color: color ?? c.ink,
          textAlign: align,
          letterSpacing: tracking,
        },
        style,
      ]}
    />
  );
}
