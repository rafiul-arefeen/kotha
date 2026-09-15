import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

import { IconButton } from './IconButton';
import { Txt } from './Txt';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  titleColor?: string;
  subtitleColor?: string;
}

/** Back button + Bangla title + small English caps subtitle, as in the mockup overlays. */
export function ScreenHeader({ title, subtitle, right, onBack, titleColor, subtitleColor }: ScreenHeaderProps) {
  const router = useRouter();
  const { c } = useTheme();

  const back = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.row}>
      <IconButton icon="←" label="ফিরে যান" onPress={back} />
      <View style={styles.titles}>
        <Txt size={20} weight={800} color={titleColor ?? c.ink} leading={1.3} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt font="en" size={10.5} weight={700} tracking={0.6} color={subtitleColor ?? c.faint} numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  titles: { flex: 1, minWidth: 0 },
});
