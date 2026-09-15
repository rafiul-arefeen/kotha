import { Alert, Platform } from 'react-native';

/** Ask before destructive actions (clearing history, resetting vocabulary). */
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const webConfirm = (globalThis as { confirm?: (text: string) => boolean }).confirm;
    if (webConfirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'না', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
