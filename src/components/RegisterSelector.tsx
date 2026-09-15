import { StyleSheet, View } from 'react-native';

import { DwellPressable } from '@/components/DwellPressable';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Txt } from '@/components/ui/Txt';
import { PRONOUN_LABEL, REGISTER_BY_ID, REGISTERS } from '@/data/registers';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import type { RegisterId } from '@/types';

/** Header pill showing who the message is for. */
export function RegisterPill({ registerId, onPress }: { registerId: RegisterId | null; onPress: () => void }) {
  const { c, register: registerTone } = useTheme();
  const r = registerId ? REGISTER_BY_ID[registerId] : null;
  const tone = r ? registerTone(r.id) : null;

  return (
    <DwellPressable
      dwell={false}
      onActivate={onPress}
      accessibilityLabel={
        r ? `কার সাথে কথা: ${r.label}, "${PRONOUN_LABEL[r.pronoun]}" রূপ। বদলাতে চাপুন` : 'কার সাথে কথা বলবেন, বেছে নিন'
      }
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: tone?.bg ?? c.warnBg,
          borderColor: tone?.border ?? c.warnBorder,
          borderStyle: r ? 'solid' : 'dashed',
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}>
      <Txt size={17} scaled={false} leading={1.3}>
        {r ? r.icon : '👥'}
      </Txt>
      <View style={styles.pillText}>
        <Txt size={15} weight={700} color={tone?.fg ?? c.warnFg} numberOfLines={1} leading={1.25}>
          {r ? r.label.split(' / ')[0] : 'কার সাথে?'}
        </Txt>
        {r ? (
          <Txt size={11} weight={700} color={tone?.fg} numberOfLines={1} leading={1.45} style={styles.pronoun}>
            {PRONOUN_LABEL[r.pronoun]}
          </Txt>
        ) : null}
      </View>
      <Txt size={11} scaled={false} color={tone?.fg ?? c.warnFg}>
        ▾
      </Txt>
    </DwellPressable>
  );
}

interface RegisterSelectorProps {
  visible: boolean;
  value: RegisterId | null;
  onSelect: (id: RegisterId) => void;
  onClose: () => void;
  note?: string;
}

/** Bottom sheet for choosing the listener (register). */
export function RegisterSelector({ visible, value, onSelect, onClose, note }: RegisterSelectorProps) {
  const { c, register: registerTone } = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="কার সাথে কথা?"
      subtitle="WHO ARE YOU TALKING TO? — sets Bangla politeness">
      {note ? (
        <View style={[styles.note, { backgroundColor: c.warnBg, borderColor: c.warnBorder }]}>
          <Txt size={15} weight={700} color={c.warnFg}>
            {note}
          </Txt>
        </View>
      ) : null}
      <View style={styles.grid}>
        {REGISTERS.map((r) => {
          const selected = r.id === value;
          const tone = registerTone(r.id);
          return (
            <DwellPressable
              key={r.id}
              onActivate={() => onSelect(r.id)}
              accessibilityLabel={`${r.label}, "${PRONOUN_LABEL[r.pronoun]}" রূপ${r.pronounCertain ? '' : ', রূপ নিশ্চিত নয়'}`}
              accessibilityState={{ selected }}
              progressColor={tone.selFg}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? tone.selBg : c.surface,
                  borderColor: selected ? tone.selBorder : c.lineSoft,
                  borderWidth: selected ? 2.5 : 2,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}>
              <Txt size={28} scaled={false} leading={1.25}>
                {r.icon}
              </Txt>
              <View style={styles.optionText}>
                <Txt size={16} weight={700} color={selected ? tone.selFg : c.inkSoft} leading={1.3}>
                  {r.label}
                </Txt>
                <Txt font="en" size={10} weight={700} color={selected ? tone.selSub : c.fainter} tracking={0.4}>
                  {r.en.toUpperCase()}
                </Txt>
                <View style={styles.tags}>
                  <View style={[styles.tag, { borderColor: selected ? tone.selBorder : c.line }]}>
                    <Txt size={12} weight={800} color={selected ? tone.selFg : c.muted} leading={1.3}>
                      {PRONOUN_LABEL[r.pronoun]}
                    </Txt>
                  </View>
                  {!r.pronounCertain ? (
                    <Txt size={12} weight={700} color={c.warnFg} leading={1.3}>
                      ⚠ যাচাই করুন
                    </Txt>
                  ) : null}
                </View>
              </View>
              {selected ? (
                <Txt size={18} weight={800} color={tone.selFg} scaled={false}>
                  ✓
                </Txt>
              ) : null}
            </DwellPressable>
          );
        })}
      </View>
      <Txt size={13} weight={600} color={c.faint} style={styles.footnote}>
        এর উপর নির্ভর করে বাক্যে &quot;তুমি&quot; না &quot;আপনি&quot; হবে। বাক্য তৈরির পরও এডিট করা যাবে।
      </Txt>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 48,
    maxWidth: 170,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  pillText: { flexShrink: 1 },
  pronoun: { opacity: 0.8 },
  note: { borderWidth: 1.5, borderRadius: radius.md, padding: 12, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 150,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.lg,
  },
  optionText: { flex: 1 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  tag: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 7 },
  footnote: { marginTop: 12 },
});
