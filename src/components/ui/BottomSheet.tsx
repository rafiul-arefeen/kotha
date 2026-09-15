import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';

import { IconButton } from './IconButton';
import { Txt } from './Txt';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function BottomSheet({ visible, onClose, title, subtitle, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}
          onPress={onClose}
          accessibilityLabel="বন্ধ করুন"
          accessibilityRole="button"
        />
        <View
          style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: Math.max(insets.bottom, 12) + 12 }]}
          accessibilityViewIsModal>
          <View style={[styles.handle, { backgroundColor: c.line }]} />
          <View style={styles.header}>
            <View style={styles.titles}>
              <Txt size={21} weight={800} accessibilityRole="header">
                {title}
              </Txt>
              {subtitle ? (
                <Txt font="en" size={11} weight={700} color={c.fainter} tracking={0.3}>
                  {subtitle}
                </Txt>
              ) : null}
            </View>
            <IconButton icon="✕" label="বন্ধ করুন" onPress={onClose} tone="warm" />
          </View>
          <ScrollView bounces={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 18,
    paddingTop: 8,
    boxShadow: '0px -16px 40px -16px rgba(40,30,18,0.4)',
  },
  handle: { width: 44, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: 4, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  titles: { flex: 1 },
  content: { paddingBottom: 4 },
});
