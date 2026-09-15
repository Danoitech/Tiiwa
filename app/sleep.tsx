import { GhostButton, PrimaryButton, Screen } from '@/components/ui';
import { getMeta, insertEvent, setMeta } from '@/db/queries';
import { useBaby } from '@/hooks/useBaby';
import { useElapsed } from '@/hooks/useElapsed';
import { pad, toLocalIso } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { toast } from '@/lib/toast';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { Moon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SleepScreen() {
  const baby = useBaby();
  const { refresh } = useStore();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const sleeping = Boolean(startedAt);
  const timer = useElapsed(sleeping, startedAt);

  useEffect(() => {
    getMeta('sleep_started_at').then((value) => {
      if (value) setStartedAt(Number(value));
    });
  }, []);

  async function startSleep() {
    const at = Date.now();
    setStartedAt(at);
    await setMeta('sleep_started_at', String(at));
    refresh();
  }

  async function endSleep() {
    if (!baby || !startedAt) return;
    const minutes = Math.max(1, timer.m || 1);
    const ended = new Date();
    const started = new Date(startedAt);
    await insertEvent({
      babyId: baby.id,
      kind: 'sleep',
      occurredAt: toLocalIso(ended),
      timePrecision: 'exact',
      payload: {
        startedAt: toLocalIso(started),
        endedAt: toLocalIso(ended),
        minutes,
      },
    });
    await setMeta('sleep_started_at', '');
    setStartedAt(null);
    refresh();
    toast('Sleep logged');
    router.back();
  }

  return (
    <Screen style={styles.wrap}>
      <View style={styles.icon}>
        <Moon size={34} color={colors.mint} />
      </View>
      {!sleeping ? (
        <>
          <Text style={styles.body}>Ready when the baby is</Text>
          <PrimaryButton label="Start sleep" onPress={startSleep} />
          <GhostButton label="Cancel" onPress={() => router.back()} />
        </>
      ) : (
        <>
          <Text style={styles.body}>Currently sleeping</Text>
          <Text style={styles.timer}>{pad(timer.m)}:{pad(timer.s)}</Text>
          <PrimaryButton label="End sleep" onPress={endSleep} color={colors.danger} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.mintDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  body: {
    fontSize: 13,
    color: colors.inkDim,
    marginBottom: 24,
    textAlign: 'center',
  },
  timer: {
    fontSize: 30,
    color: colors.ink,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    marginBottom: 26,
  },
});
