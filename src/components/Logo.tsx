import { View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { gradients, palette, shadows } from '@/theme';

export function Logo({ size = 40 }: { size?: number }) {
  const { highContrast } = useTheme();
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        backgroundColor: highContrast ? '#000' : palette.logoB,
        experimental_backgroundImage: highContrast ? undefined : gradients.logo,
        boxShadow: highContrast ? undefined : shadows.logo,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Txt size={Math.round(size * 0.55)} scaled={false} weight={800} color="#fff" leading={1.25}>
        ক
      </Txt>
    </View>
  );
}
