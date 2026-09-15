import { colors } from '@/theme/colors';
import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function PinPad({
  onComplete,
  error,
}: {
  onComplete: (pin: string) => void;
  error?: string | null;
}) {
  const [value, setValue] = useState('');

  function press(digit: string) {
    if (value.length >= 4) return;
    Haptics.selectionAsync();
    const next = value + digit;
    setValue(next);
    if (next.length === 4) {
      onComplete(next);
      setTimeout(() => setValue(''), 200);
    }
  }

  function backspace() {
    Haptics.selectionAsync();
    setValue((v) => v.slice(0, -1));
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <View>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, value.length > i && styles.dotFilled, error ? styles.dotError : null]} />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : <View style={{ height: 22 }} />}
      <View style={styles.grid}>
        {keys.map((key) => {
          if (key === '') return <View key="empty" style={styles.key} />;
          if (key === 'del') {
            return (
              <Pressable key="del" onPress={backspace} style={styles.key}>
                <Delete size={22} color={colors.ink} />
              </Pressable>
            );
          }
          return (
            <Pressable key={key} onPress={() => press(key)} style={styles.key}>
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.inkDim,
  },
  dotFilled: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  dotError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  error: {
    textAlign: 'center',
    color: colors.danger,
    fontSize: 12,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    alignSelf: 'center',
  },
  key: {
    width: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    color: colors.ink,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
