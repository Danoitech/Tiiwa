import { Segmented } from '@/components/Segmented';
import { PrimaryButton, Screen } from '@/components/ui';
import { getMeta, insertEvent, insertNappies, setMeta } from '@/db/queries';
import { useBaby } from '@/hooks/useBaby';
import { useElapsed } from '@/hooks/useElapsed';
import { pad, TIME_PERIOD_LABELS, TIME_PERIODS, toLocalIso, type TimePeriod } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { toast } from '@/lib/toast';
import { colors } from '@/theme/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { Droplet, Milk, Minus, Plus, X } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NappyColour, NappyType, TimePrecision } from '@/db/types';

export default function LogScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const baby = useBaby();
  const { refresh } = useStore();
  const [logType, setLogType] = useState<'feed' | 'nappy'>(type === 'nappy' ? 'nappy' : 'feed');
  const [feedMethod, setFeedMethod] = useState<'breast' | 'bottle'>('breast');
  const [feedMin, setFeedMin] = useState(15);
  const [feeding, setFeeding] = useState(false);
  const [feedStart, setFeedStart] = useState<number | null>(null);
  const feedTimer = useElapsed(feeding, feedStart);
  const [nappyType, setNappyType] = useState<NappyType>('both');
  const [nappyQty, setNappyQty] = useState(1);
  const [colour, setColour] = useState<NappyColour | null>(null);
  const [notes, setNotes] = useState('');
  const [precision, setPrecision] = useState<TimePrecision>('exact');
  const [period, setPeriod] = useState<TimePeriod>('morning');

  useEffect(() => {
    if (type === 'nappy' || type === 'feed') setLogType(type);
  }, [type]);

  useEffect(() => {
    getMeta('feed_started_at').then((value) => {
      if (value) {
        setFeedStart(Number(value));
        setFeeding(true);
      }
    });
  }, []);

  async function toggleFeedTimer() {
    if (feeding) {
      setFeeding(false);
      setFeedMin(Math.max(1, feedTimer.m || 1));
      await setMeta('feed_started_at', '');
    } else {
      const started = Date.now();
      setFeedMin(0);
      setFeedStart(started);
      setFeeding(true);
      await setMeta('feed_started_at', String(started));
    }
  }

  function occurredAt() {
    const now = new Date();
    if (precision === 'unknown') {
      now.setHours(12, 0, 0, 0);
      return toLocalIso(now);
    }
    if (precision === 'period') {
      const hours: Record<TimePeriod, number> = {
        before_daybreak: 5, morning: 8, midday: 12, afternoon: 15, evening: 19, night: 22,
      };
      now.setHours(hours[period], 0, 0, 0);
      return toLocalIso(now);
    }
    return toLocalIso(now);
  }

  async function saveFeed() {
    if (!baby || feeding) return;
    await insertEvent({
      babyId: baby.id,
      kind: 'feed',
      occurredAt: occurredAt(),
      timePrecision: precision,
      timePeriod: precision === 'period' ? period : null,
      payload: { method: feedMethod, minutes: feedMin },
      notes: notes.trim() || null,
    });
    await setMeta('feed_started_at', '');
    refresh();
    toast('Feed logged');
    router.back();
  }

  async function saveNappy() {
    if (!baby) return;
    await insertNappies({
      babyId: baby.id,
      type: nappyType,
      quantity: nappyQty,
      colour: nappyType === 'wet' ? null : colour,
      notes: notes.trim() || null,
      occurredAt: occurredAt(),
      timePrecision: precision,
      timePeriod: precision === 'period' ? period : null,
    });
    refresh();
    toast('Nappy logged');
    router.back();
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <X size={20} color={colors.inkDim} />
          </Pressable>
          <Text style={styles.title}>Log an event</Text>
        </View>

        <Segmented
          value={logType}
          onChange={(v) => setLogType(v as 'feed' | 'nappy')}
          activeBg={logType === 'feed' ? colors.amberDeep : colors.peachDeep}
          activeColor={logType === 'feed' ? colors.amber : colors.peach}
          options={[
            { value: 'feed', label: 'Feed', icon: <Milk size={14} color={logType === 'feed' ? colors.amber : colors.inkDim} /> },
            { value: 'nappy', label: 'Nappy', icon: <Droplet size={14} color={logType === 'nappy' ? colors.peach : colors.inkDim} /> },
          ]}
        />

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {logType === 'feed' ? (
            <>
              <Text style={styles.label}>Method</Text>
              <View style={styles.grid2}>
                {(['breast', 'bottle'] as const).map((method) => (
                  <Choice key={method} label={method} active={feedMethod === method} onPress={() => setFeedMethod(method)} activeBg={colors.amberDeep} activeColor={colors.amber} />
                ))}
              </View>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.timerCard}>
                <Text style={styles.timer}>
                  {feeding ? `${pad(feedTimer.m)}:${pad(feedTimer.s)}` : `${feedMin} min`}
                </Text>
                <Pressable onPress={toggleFeedTimer} style={[styles.timerBtn, { backgroundColor: feeding ? colors.danger : colors.amber }]}>
                  <Text style={styles.timerBtnText}>{feeding ? 'Stop' : 'Start feed'}</Text>
                </Pressable>
                {!feeding && (
                  <View style={styles.stepper}>
                    <Round onPress={() => setFeedMin((m) => Math.max(0, m - 1))}><Minus size={13} color={colors.ink} /></Round>
                    <Text style={styles.stepLabel}>adjust manually</Text>
                    <Round onPress={() => setFeedMin((m) => m + 1)}><Plus size={13} color={colors.ink} /></Round>
                  </View>
                )}
              </View>
              <TimeFields precision={precision} setPrecision={setPrecision} period={period} setPeriod={setPeriod} />
              <Notes value={notes} onChange={setNotes} />
              <PrimaryButton label="Save feed" onPress={saveFeed} color={colors.amber} disabled={feeding} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Type</Text>
              <View style={styles.grid3}>
                {([['wet', 'Wet'], ['dirty', 'Dirty'], ['both', 'Both']] as const).map(([value, label]) => (
                  <Choice key={value} label={label} active={nappyType === value} onPress={() => setNappyType(value)} activeBg={colors.peachDeep} activeColor={colors.peach} />
                ))}
              </View>
              <Text style={styles.label}>Quantity</Text>
              <View style={[styles.stepper, { marginBottom: 18 }]}>
                <Round onPress={() => setNappyQty((q) => Math.max(1, q - 1))} big><Minus size={16} color={colors.ink} /></Round>
                <Text style={styles.qty}>{nappyQty}</Text>
                <Round onPress={() => setNappyQty((q) => q + 1)} big><Plus size={16} color={colors.ink} /></Round>
              </View>
              {nappyType !== 'wet' && (
                <>
                  <Text style={styles.label}>Colour (optional)</Text>
                  <View style={styles.chips}>
                    {(['normal', 'light_brown', 'dark_brown', 'green', 'yellow'] as const).map((c) => (
                      <Pressable key={c} onPress={() => setColour(c)} style={[styles.chip, colour === c && { backgroundColor: colors.peachDeep }]}>
                        <Text style={[styles.chipText, colour === c && { color: colors.peach }]}>{c.replace('_', ' ')}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
              <TimeFields precision={precision} setPrecision={setPrecision} period={period} setPeriod={setPeriod} />
              <Notes value={notes} onChange={setNotes} />
              <PrimaryButton label="Save nappy" onPress={saveNappy} color={colors.peach} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function TimeFields({
  precision,
  setPrecision,
  period,
  setPeriod,
}: {
  precision: TimePrecision;
  setPrecision: (v: TimePrecision) => void;
  period: TimePeriod;
  setPeriod: (v: TimePeriod) => void;
}) {
  return (
    <>
      <Text style={styles.label}>When</Text>
      <View style={styles.chips}>
        {([['exact', 'Now'], ['period', 'Approximate'], ['unknown', 'Unknown']] as const).map(([value, label]) => (
          <Pressable key={value} onPress={() => setPrecision(value)} style={[styles.chip, precision === value && { backgroundColor: colors.cardSoft }]}>
            <Text style={[styles.chipText, precision === value && { color: colors.ink }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {precision === 'period' && (
        <View style={styles.chips}>
          {TIME_PERIODS.map((value) => (
            <Pressable key={value} onPress={() => setPeriod(value)} style={[styles.chip, period === value && { backgroundColor: colors.cardSoft }]}>
              <Text style={[styles.chipText, period === value && { color: colors.ink }]}>{TIME_PERIOD_LABELS[value]}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

function Notes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput value={value} onChangeText={onChange} placeholder="Anything useful" placeholderTextColor={colors.inkDim} style={styles.notes} />
    </>
  );
}

function Choice({ label, active, onPress, activeBg, activeColor }: { label: string; active: boolean; onPress: () => void; activeBg: string; activeColor: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, { backgroundColor: active ? activeBg : colors.card }]}>
      <Text style={[styles.choiceText, { color: active ? activeColor : colors.inkDim, textTransform: 'capitalize' }]}>{label}</Text>
    </Pressable>
  );
}

function Round({ children, onPress, big }: { children: ReactNode; onPress: () => void; big?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.round, big && { width: 36, height: 36, backgroundColor: colors.card }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  title: {
    fontSize: 17,
    color: colors.ink,
    fontWeight: '500',
  },
  body: {
    marginTop: 22,
    paddingBottom: 32,
  },
  label: {
    fontSize: 12,
    color: colors.inkDim,
    marginBottom: 10,
  },
  grid2: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  grid3: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  choice: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceText: {
    fontSize: 13,
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
  },
  timerBtn: {
    width: 150,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.onAccent,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
  },
  stepLabel: {
    fontSize: 11,
    color: colors.inkDim,
  },
  round: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 18,
    color: colors.ink,
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    color: colors.inkDim,
    textTransform: 'capitalize',
  },
  notes: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    color: colors.ink,
    marginBottom: 16,
  },
});
