import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useScreenReaderEnabled } from '@/hooks/useScreenReaderEnabled';
import { usePreferences } from '@/state/PreferencesContext';

export interface DwellPressableProps extends Omit<PressableProps, 'onPress' | 'style' | 'children'> {
  onActivate: () => void;
  accessibilityLabel: string;
  /** Set false for controls that should never require dwell (e.g. settings). */
  dwell?: boolean;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** Colour of the dwell progress fill. */
  progressColor?: string;
  children: ReactNode;
}

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * A button that supports dwell selection for users with limited motor control.
 *
 * - Dwell off: behaves like a normal tap target.
 * - Dwell on:  the user presses and holds; a fill rises and the action fires
 *   when it is full. Lifting the finger early or sliding off cancels, which
 *   prevents accidental activations from tremor or brushing the screen.
 * - Screen reader on: activates on TalkBack double-tap, since holding is not
 *   possible there.
 */
export function DwellPressable({
  onActivate,
  dwell = true,
  style,
  progressColor = '#2c2823',
  children,
  disabled,
  accessibilityHint,
  accessibilityState,
  ...rest
}: DwellPressableProps) {
  const { preferences } = usePreferences();
  const screenReader = useScreenReaderEnabled();
  const dwellMs = dwell ? preferences.dwellMs : 0;
  const active = dwellMs > 0 && !screenReader && !disabled;

  const [progress] = useState(() => new Animated.Value(0));
  const [dwelling, setDwelling] = useState(false);
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  const cancel = () => {
    animation.current?.stop();
    animation.current = null;
    progress.setValue(0);
    setDwelling(false);
  };

  const onPressIn = () => {
    if (!active) return;
    progress.setValue(0);
    setDwelling(true);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: dwellMs,
      easing: Easing.linear,
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    animation.current = anim;
    anim.start(({ finished }) => {
      if (!finished || animation.current !== anim) return;
      animation.current = null;
      progress.setValue(0);
      setDwelling(false);
      onActivate();
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={4}
      {...rest}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      accessibilityHint={active ? `${accessibilityHint ? `${accessibilityHint}। ` : ''}বেছে নিতে চেপে ধরে রাখুন` : accessibilityHint}
      onPress={() => {
        if (!active && !disabled) onActivate();
      }}
      onPressIn={onPressIn}
      onPressOut={() => active && cancel()}
      style={(state) => {
        const s = typeof style === 'function' ? style({ pressed: state.pressed || dwelling }) : style;
        return [s, styles.clip];
      }}>
      {children}
      {active ? (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.fill,
              { backgroundColor: progressColor, opacity: dwelling ? 0.22 : 0, transform: [{ scaleY: progress }] },
            ]}
          />
          <Animated.View
            style={[
              styles.bar,
              { backgroundColor: progressColor, opacity: dwelling ? 0.9 : 0, transform: [{ scaleX: progress }] },
            ]}
          />
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  fill: { transformOrigin: 'bottom', pointerEvents: 'none' },
  bar: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 7,
    transformOrigin: 'left',
  },
});
