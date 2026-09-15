import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { radius, shadows } from '@/theme';

type Tone = 'info' | 'warn';

interface ToastValue {
  show: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: Tone; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (message: string, tone: Tone = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    AccessibilityInfo.announceForAccessibility(message);
    timer.current = setTimeout(() => setToast(null), tone === 'warn' ? 3200 : 2200);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext value={{ show }}>
      {children}
      {toast ? <ToastView key={toast.id} message={toast.message} tone={toast.tone} /> : null}
    </ToastContext>
  );
}

function ToastView({ message, tone }: { message: string; tone: Tone }) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [anim]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        { pointerEvents: 'none' },
        {
          top: insets.top + 64,
          backgroundColor: tone === 'warn' ? '#5a3a10' : c.toast,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
        },
      ]}>
      <Txt size={16} weight={700} color="#fff" align="center">
        {message}
      </Txt>
    </Animated.View>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignSelf: 'center',
    maxWidth: 520,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    boxShadow: shadows.toast,
    zIndex: 100,
    elevation: 12,
  },
});
