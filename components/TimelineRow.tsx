import { eventLabel, eventTimeLabel } from '@/db/queries';
import type { EventRow } from '@/db/types';
import { colors } from '@/theme/colors';
import { Droplet, Milk, Moon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const palette = {
  feed: [colors.amberDeep, colors.amber],
  sleep: [colors.mintDeep, colors.mint],
  nappy: [colors.peachDeep, colors.peach],
} as const;

export function TimelineRow({ event, onLongPress }: { event: EventRow; onLongPress?: () => void }) {
  const [bg, fg] = palette[event.kind];
  const icon =
    event.kind === 'feed' ? <Milk size={13} color={fg} /> :
    event.kind === 'sleep' ? <Moon size={13} color={fg} /> :
    <Droplet size={13} color={fg} />;

  return (
    <Pressable onLongPress={onLongPress} style={styles.row}>
      <View style={[styles.icon, { backgroundColor: bg }]}>{icon}</View>
      <Text style={styles.label}>{eventLabel(event)}</Text>
      <Text style={styles.time}>{eventTimeLabel(event)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  time: {
    fontSize: 12,
    color: colors.inkDim,
  },
});
