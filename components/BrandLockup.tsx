import { BrandMark } from '@/components/BrandMark';
import { colors } from '@/theme/colors';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export function BrandLockup({ animated = false }: { animated?: boolean }) {
  const fade = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const lift = useRef(new Animated.Value(animated ? 10 : 0)).current;
  const ticks = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(ticks, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [animated, fade, lift, ticks]);

  return (
    <View style={styles.wrap}>
      <BrandMark size={104} />
      <Animated.View style={[styles.copy, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <Text style={styles.title}>Tiiwa</Text>
        <Text style={styles.tagline}>for the hours between sleeps</Text>
      </Animated.View>
      <Animated.View style={[styles.ticks, { opacity: ticks }]}>
        <View style={[styles.tick, { backgroundColor: colors.amber }]} />
        <View style={[styles.tick, { backgroundColor: colors.mint }]} />
        <View style={[styles.tick, { backgroundColor: colors.peach }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 18,
  },
  copy: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 13,
    color: colors.inkDim,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  ticks: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tick: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
