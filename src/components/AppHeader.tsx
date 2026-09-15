import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { RegisterPill } from '@/components/RegisterSelector';
import { IconButton } from '@/components/ui/IconButton';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/hooks/useTheme';
import type { RegisterId } from '@/types';

interface AppHeaderProps {
  registerId: RegisterId | null;
  onOpenRegister: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function AppHeader({ registerId, onOpenRegister, onOpenHistory, onOpenSettings }: AppHeaderProps) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const narrow = width < 380;

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Logo size={narrow ? 36 : 40} />
        {!narrow ? (
          <View>
            <Txt size={22} weight={800} color={c.ink} leading={1.2} scaled={false}>
              কথা
            </Txt>
            <Txt font="en" size={9.5} weight={700} color={c.faint} tracking={1.2} scaled={false}>
              KOTHA · SPEAK
            </Txt>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <RegisterPill registerId={registerId} onPress={onOpenRegister} />
        <IconButton icon="🕘" label="ইতিহাস" onPress={onOpenHistory} />
        <IconButton icon="⚙️" label="সেটিংস ও সহজ ব্যবহার" onPress={onOpenSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
});
