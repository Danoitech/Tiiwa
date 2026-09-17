import { TimelineRow } from '@/components/TimelineRow';
import { Screen } from '@/components/ui';
import { WeekChart, type WeekPoint } from '@/components/WeekChart';
import { deleteEvent, getEventsForDate, statsFromEvents } from '@/db/queries';
import { useBaby } from '@/hooks/useBaby';
import { addDays, dateKey, formatShortDate, parseLocalIso, startOfDay } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { colors } from '@/theme/colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsScreen() {
  const baby = useBaby();
  const { tick, refresh } = useStore();
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const [events, setEvents] = useState<Awaited<ReturnType<typeof getEventsForDate>>>([]);
  const [week, setWeek] = useState<WeekPoint[]>([]);

  useEffect(() => {
    (async () => {
      if (!baby) return;
      const rows = await getEventsForDate(baby.id, dateKey(day));
      setEvents(rows);
    })();
  }, [baby, day, tick]);

  useEffect(() => {
    (async () => {
      if (!baby) return;
      const points: WeekPoint[] = [];
      const today = startOfDay(new Date());
      for (let i = 6; i >= 0; i -= 1) {
        const d = addDays(today, -i);
        const rows = await getEventsForDate(baby.id, dateKey(d));
        const stats = statsFromEvents(rows);
        points.push({
          key: dateKey(d),
          day: WEEKDAYS[d.getDay()],
          feeds: stats.feeds,
          nappies: stats.nappies,
          sleep: Math.round((stats.sleepMinutes / 60) * 10) / 10,
        });
      }
      setWeek(points);
    })();
  }, [baby, tick]);

  const averages = useMemo(() => {
    if (week.length === 0) return { feeds: 0, nappies: 0, sleep: 0 };
    const n = week.length;
    return {
      feeds: week.reduce((s, d) => s + d.feeds, 0) / n,
      nappies: week.reduce((s, d) => s + d.nappies, 0) / n,
      sleep: week.reduce((s, d) => s + d.sleep, 0) / n,
    };
  }, [week]);

  function confirmDelete(id: number) {
    Alert.alert('Delete this event?', 'This only removes it from the log on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(id);
          refresh();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.sub}>Last 7 days</Text>
        <WeekChart
          data={week}
          selectedKey={dateKey(day)}
          onSelect={(key) => setDay(startOfDay(parseLocalIso(`${key}T00:00:00`)))}
        />
        <View style={styles.avgs}>
          <Avg value={averages.feeds.toFixed(1)} label="avg feeds" color={colors.amber} />
          <Avg value={`${averages.sleep.toFixed(1)}h`} label="avg sleep" color={colors.mint} />
          <Avg value={averages.nappies.toFixed(1)} label="avg nappies" color={colors.peach} />
        </View>
        <Text style={styles.noteText}>
          Tracking totals only, not medical advice. Sleep hours are what you logged.
        </Text>
        <View style={styles.dateRow}>
          <Pressable onPress={() => setDay((d) => addDays(d, -1))} hitSlop={12}>
            <ChevronLeft size={18} color={colors.inkDim} />
          </Pressable>
          <Text style={styles.dateLabel}>{formatShortDate(day)}</Text>
          <Pressable onPress={() => setDay((d) => addDays(d, 1))} hitSlop={12}>
            <ChevronRight size={18} color={colors.inkDim} />
          </Pressable>
        </View>
      </View>
      <FlatList
        style={styles.log}
        data={events}
        keyExtractor={(event) => String(event.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.logContent}
        ListEmptyComponent={<Text style={styles.empty}>No events on this day.</Text>}
        ListFooterComponent={
          events.length > 0 ? <Text style={styles.hint}>Long-press an event to delete it.</Text> : null
        }
        renderItem={({ item }) => (
          <TimelineRow event={item} onLongPress={() => confirmDelete(item.id)} />
        )}
      />
    </Screen>
  );
}

function Avg({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.avg}>
      <Text style={[styles.avgValue, { color }]}>{value}</Text>
      <Text style={styles.avgLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
  },
  log: {
    flex: 1,
  },
  logContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 17,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 8,
  },
  dateLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
  },
  empty: {
    color: colors.inkDim,
    fontSize: 13,
    marginTop: 8,
  },
  hint: {
    fontSize: 11,
    color: colors.inkDim,
    marginTop: 12,
  },
  sub: {
    fontSize: 12,
    color: colors.inkDim,
    marginBottom: 10,
  },
  avgs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  avg: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  avgValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  avgLabel: {
    fontSize: 9,
    color: colors.inkDim,
  },
  noteText: {
    fontSize: 11,
    color: colors.inkDim,
    lineHeight: 16,
  },
});
