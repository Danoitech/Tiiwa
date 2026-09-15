import { BrandMark } from '@/components/BrandMark';
import { Screen } from '@/components/ui';
import { upsertBaby } from '@/db/queries';
import { useStore } from '@/lib/store';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { ChevronRight, Droplet, Milk, Moon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function WelcomeScreen() {
  const { refresh } = useStore();
  const [step, setStep] = useState(0);
  const [babyName, setBabyName] = useState('');
  const [saving, setSaving] = useState(false);

  async function finish(name: string | null) {
    const trimmed = name?.trim() || 'Baby';
    setSaving(true);
    try {
      await upsertBaby(trimmed, null);
      refresh();
      router.push('/set-pin');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen style={styles.wrap}>
      {step < 2 ? (
        <Pressable onPress={() => finish(null)} style={styles.skipWrap} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      ) : (
        <View style={styles.skipWrap} />
      )}

      <View style={styles.center}>
        {step === 0 && (
          <>
            <View style={styles.icons}>
              <View style={[styles.tile, { backgroundColor: colors.amberDeep }]}>
                <Milk size={24} color={colors.amber} />
              </View>
              <View style={[styles.tile, styles.tileDropped, { backgroundColor: colors.mintDeep }]}>
                <Moon size={24} color={colors.mint} />
              </View>
              <View style={[styles.tile, { backgroundColor: colors.peachDeep }]}>
                <Droplet size={24} color={colors.peach} />
              </View>
            </View>
            <Text style={styles.title}>Everything about today, in one glance.</Text>
            <Text style={styles.body}>Feeds, sleep, and nappies — logged in one tap, even at 3am.</Text>
          </>
        )}

        {step === 1 && (
          <>
            <View style={styles.timerCard}>
              <Text style={styles.timer}>04:12</Text>
              <View style={styles.stop}>
                <Text style={styles.stopText}>Stop</Text>
              </View>
            </View>
            <Text style={styles.title}>Timers that just work.</Text>
            <Text style={styles.body}>
              Start a feed or sleep with one tap. Tiiwa keeps time so you don't have to do the maths half-asleep.
            </Text>
          </>
        )}

        {step === 2 && (
          <>
            <BrandMark size={64} />
            <Text style={styles.title}>Who are we tracking?</Text>
            <Text style={styles.body}>You can change this anytime in Settings.</Text>
            <TextInput
              value={babyName}
              onChangeText={setBabyName}
              placeholder="Baby's name"
              placeholderTextColor={colors.inkDim}
              style={styles.input}
            />
          </>
        )}
      </View>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {step < 2 ? (
        <Pressable onPress={() => setStep(step + 1)} style={styles.next}>
          <Text style={styles.nextText}>Next</Text>
          <ChevronRight size={16} color={colors.onAccent} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => finish(babyName)}
          disabled={saving}
          style={[styles.next, { backgroundColor: colors.amber }]}
        >
          <Text style={styles.nextText}>{saving ? 'Saving…' : 'Start using Tiiwa'}</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipWrap: {
    height: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    fontSize: 12,
    color: colors.inkDim,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 8,
  },
  icons: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 4,
  },
  tile: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDropped: {
    marginTop: 18,
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  timer: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  stop: {
    height: 34,
    width: 120,
    borderRadius: 999,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onAccent,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  body: {
    fontSize: 13,
    color: colors.inkDim,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
    marginTop: -10,
  },
  input: {
    width: 220,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardSoft,
    color: colors.ink,
    fontSize: 15,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.cardSoft,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.mint,
  },
  next: {
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onAccent,
  },
});
