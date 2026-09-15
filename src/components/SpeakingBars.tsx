import { useEffect, useState } from 'react';
import { Animated, Platform, View } from 'react-native';

import { palette } from '@/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/** Animated equaliser shown while a message is being spoken. */
export function SpeakingBars({ active, color = palette.bar, height = 26 }: { active: boolean; color?: string; height?: number }) {
  const [bars] = useState(() => [0, 1, 2, 3].map(() => new Animated.Value(0.35)));

  useEffect(() => {
    if (!active) return;
    const loops = bars.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(value, { toValue: 1, duration: 380, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(value, { toValue: 0.35, duration: 380, useNativeDriver: USE_NATIVE_DRIVER }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => {
      loops.forEach((loop) => loop.stop());
      bars.forEach((value) => value.setValue(0.35));
    };
  }, [active, bars]);

  if (!active) return null;
  return (
    <View
      accessible
      accessibilityLabel="কথা বলা হচ্ছে"
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height }}>
      {bars.map((value, i) => (
        <Animated.View
          key={i}
          style={{
            width: 5,
            height,
            borderRadius: 3,
            backgroundColor: color,
            transformOrigin: 'bottom',
            transform: [{ scaleY: value }],
          }}
        />
      ))}
    </View>
  );
}
