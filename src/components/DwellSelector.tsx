import { StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/state/ToastContext';
import { radius } from '@/theme';
import type { DwellMs } from '@/types';
import { toBanglaDigits } from '@/utils/bangla';

const OPTIONS: { value: DwellMs; label: string; sub: string }[] = [
  { value: 0, label: 'বন্ধ', sub: 'OFF' },
  { value: 1000, label: '১ সেকেন্ড', sub: '1 s' },
  { value: 1500, label: '১.৫ সেকেন্ড', sub: '1.5 s' },
  { value: 2000, label: '২ সেকেন্ড', sub: '2 s' },
];

interface DwellSelectorProps {
  value: DwellMs;
  onChange: (value: DwellMs) => void;
  showTester?: boolean;
}

export function DwellSelector({ value, onChange, showTester = false }: DwellSelectorProps) {
  const { c } = useTheme();
  const toast = useToast();

  return (
    <View style={styles.wrap}>
      <OptionGroup options={OPTIONS} value={value} onChange={onChange} accessibilityLabel="ধরে রেখে বেছে নেওয়ার সময়" columns={2} />
      <Txt size={14} weight={600} color={c.muted}>
        {value === 0
          ? 'একবার ছুঁলেই বেছে নেওয়া হবে।'
          : `বোতাম ${toBanglaDigits(value / 1000)} সেকেন্ড চেপে ধরে রাখলে তবেই বেছে নেওয়া হবে। আগে আঙুল তুললে বাতিল হবে — ভুল চাপ এড়াতে সাহায্য করে।`}
      </Txt>
      {showTester && value > 0 ? (
        <DwellPressable
          onActivate={() => toast.show('✓ ঠিকমতো কাজ করছে!')}
          accessibilityLabel="পরীক্ষা বোতাম"
          progressColor={c.optFg}
          style={({ pressed }) => [
            styles.tester,
            { backgroundColor: c.optBg, borderColor: c.optBorder, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}>
          <Txt size={17} weight={800} color={c.optFg} align="center">
            👆 এখানে চেপে ধরে পরীক্ষা করুন
          </Txt>
        </DwellPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  tester: {
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
});
