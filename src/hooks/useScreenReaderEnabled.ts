import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** TalkBack users activate with a double tap, so dwell must not block them. */
export function useScreenReaderEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // react-native-web cannot detect screen readers and always reports `true`,
    // which would silently disable dwell in the browser preview.
    if (Platform.OS === 'web') return;
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((value) => alive && setEnabled(value))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}
