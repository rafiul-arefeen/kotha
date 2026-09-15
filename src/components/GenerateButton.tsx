import type { StyleProp, ViewStyle } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';

interface GenerateButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GenerateButton({ onPress, loading, disabled, style }: GenerateButtonProps) {
  return (
    <ActionButton
      icon="✨"
      label="AI বাক্য"
      sublabel="MAKE SENTENCE"
      variant="ai"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      accessibilityLabel="AI দিয়ে পুরো বাক্য বানান"
      style={style}
    />
  );
}
