import { RhythmChart } from '@/components/RhythmChart';
import { Screen } from '@/components/ui';
import { getEventsForDate, getMeta, statsFromEvents, type DayStats } from '@/db/queries';
import { useBaby } from '@/hooks/useBaby';
import { useElapsed } from '@/hooks/useElapsed';
import { formatDuration, formatLongDate, pad, dateKey } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { Droplet, Milk, Moon } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const emptyStats: DayStats = {
  feeds: 0,
  nappies: 0,
  nappyWet: 0,
  nappyDirty: 0,
  nappyBoth: 0,
  sleepMinutes: 0,
  feedHours: [],
  nappyHours: [],
  sleepBands: [],
};

export default function DashboardScreen() {
  const baby = useBaby();
  const { tick } = useStore();
  const [stats, setStats] = useState<DayStats>(emptyStats);
  const [sleepStartedAt, setSleepStartedAt] = useState<number | null>(null);
  const sleeping = Boolean(sleepStartedAt);
  const timer = useElapsed(sleeping, sleepStartedAt);

  useEffect(() => {
    (async () => {
      if (!baby) return;
      const rows = await getEventsForDate(baby.id, dateKey(new Date()));
      setStats(statsFromEvents(rows));
      const started = await getMeta('sleep_started_at');
      setSleepStartedAt(started ? Number(started) : null);
    })();
  }, [baby, tick]);

  const liveSleep = sleeping ? Math.floor(timer.elapsed / 60000) : 0;
  const sleepLabel = formatDuration(stats.sleepMinutes + liveSleep);

  let insight = 'Nothing logged today yet. The buttons above are enough when you need them.';
  if (stats.feeds >= 2) {
    insight = `Feeds are landing through the day. These numbers are a record, not a diagnosis.`;
  } else if (stats.nappies > 0) {
    insight = `${stats.nappies} napp${stats.nappies === 1 ? 'y' : 'ies'} so far today.`;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{formatLongDate(new Date())}</Text>
        <Text style={styles.hello}>Watching over {baby?.name ?? 'baby'}</Text>

        <View style={styles.orbWrap}>
          <View style={[styles.glow, { backgroundColor: sleeping ? 'rgba(46,156,137,0.22)' : 'rgba(232,166,61,0.18)' }]}>
            <View style={styles.orb}>
              {sleeping ? <Moon size={20} color={colors.mint} /> : <Milk size={20} color={colors.amber} />}
              <Text style={styles.orbTitle}>
                {sleeping ? `${pad(timer.m)}:${pad(timer.s)}` : 'Awake'}
              </Text>
              <Text style={styles.orbSub}>{sleeping ? 'asleep' : 'ready when you are'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pills}>
          <Pill icon={<Milk size={22} color={colors.amber} />} label="Feed" glow={colors.amberDeep} onPress={() => router.push({ pathname: '/log', params: { type: 'feed' } })} />
          <Pill icon={<Moon size={22} color={colors.mint} />} label="Sleep" glow={colors.mintDeep} onPress={() => router.push('/sleep')} />
          <Pill icon={<Droplet size={22} color={colors.peach} />} label="Nappy" glow={colors.peachDeep} onPress={() => router.push({ pathname: '/log', params: { type: 'nappy' } })} />
        </View>

        <RhythmChart stats={stats} />

        <View style={styles.counts}>
          <Count value={String(stats.feeds)} label="feeds today" color={colors.amber} />
          <Count value={sleepLabel} label="sleep today" color={colors.mint} />
          <Count value={String(stats.nappies)} label="nappies today" color={colors.peach} />
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>{insight}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Pill({ icon, label, glow, onPress }: { icon: ReactNode; label: string; glow: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.pill}>
      <View style={[styles.pillIcon, { backgroundColor: glow }]}>{icon}</View>
      <Text style={styles.pillLabel}>{label}</Text>
    </Pressable>
  );
}

function Count({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.count}>
      <Text style={[styles.countValue, { color }]}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  date: {
    fontSize: 12,
    color: colors.inkDim,
  },
  hello: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 18,
  },
  orbWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  glow: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  orbTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  orbSub: {
    fontSize: 9,
    color: colors.inkDim,
  },
  pills: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pillIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 12,
    color: colors.ink,
    opacity: 0.85,
  },
  counts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  count: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  countValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  countLabel: {
    fontSize: 10,
    color: colors.inkDim,
  },
  note: {
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteText: {
    fontSize: 12,
    color: colors.inkDim,
    lineHeight: 18,
  },
});
