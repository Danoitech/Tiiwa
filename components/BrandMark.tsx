import { colors } from '@/theme/colors';
import { Moon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function BrandMark({ size = 96 }: { size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const r = size * 0.34;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 1300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ scale }] }}>
      <View style={[styles.blob, { width: r, height: r, borderRadius: r / 2, backgroundColor: colors.amberDeep, top: size * 0.06, left: size * 0.33 }]} />
      <View style={[styles.blob, { width: r, height: r, borderRadius: r / 2, backgroundColor: colors.mintDeep, top: size * 0.38, left: size * 0.04 }]} />
      <View style={[styles.blob, { width: r, height: r, borderRadius: r / 2, backgroundColor: colors.peachDeep, top: size * 0.38, left: size * 0.62 }]} />
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.moon}>
          <Moon size={size * 0.28} color={colors.ink} strokeWidth={1.8} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
  moon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
