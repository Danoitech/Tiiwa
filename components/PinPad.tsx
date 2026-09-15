import { colors } from '@/theme/colors';
import * as Haptics from 'expo-haptics';
import { Fingerprint, X } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const LETTERS: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export function PinPad({
  onComplete,
  error,
  onBiometrics,
  biometricsLabel = 'Face ID',
  disabled,
  onInput,
}: {
  onComplete: (pin: string) => void;
  error?: string | null;
  onBiometrics?: () => void;
  biometricsLabel?: string;
  disabled?: boolean;
  onInput?: () => void;
}) {
  const [value, setValue] = useState('');

  function press(digit: string) {
    if (disabled || value.length >= 4) return;
    Haptics.selectionAsync();
    onInput?.();
    const next = value + digit;
    setValue(next);
    if (next.length === 4) {
      onComplete(next);
      setTimeout(() => setValue(''), 180);
    }
  }

  function backspace() {
    if (disabled) return;
    Haptics.selectionAsync();
    setValue((v) => v.slice(0, -1));
  }

  function biometrics() {
    if (disabled || !onBiometrics) return;
    Haptics.selectionAsync();
    onBiometrics();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              value.length > i && styles.dotFilled,
              error && value.length > i ? styles.dotError : null,
            ]}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorSpacer} />}
      <View style={styles.grid}>
        {ROWS.map((row) => (
          <View key={row[0]} style={styles.row}>
            {row.map((digit) => (
              <Key key={digit} label={digit} onPress={() => press(digit)}>
                <Text style={styles.digit}>{digit}</Text>
                {LETTERS[digit] ? <Text style={styles.letters}>{LETTERS[digit]}</Text> : null}
              </Key>
            ))}
          </View>
        ))}
        <View style={styles.row}>
          <Pressable
            onPress={biometrics}
            disabled={!onBiometrics}
            style={styles.sideKey}
            accessibilityLabel={biometricsLabel}
          >
            {onBiometrics ? (
              <>
                <Fingerprint size={26} color={colors.mint} strokeWidth={1.8} />
                <Text style={styles.bioLabel}>{biometricsLabel}</Text>
              </>
            ) : null}
          </Pressable>
          <Key label="0" onPress={() => press('0')}>
            <Text style={styles.digit}>0</Text>
          </Key>
          <Pressable onPress={backspace} style={styles.sideKey} accessibilityLabel="Delete">
            <View style={styles.deleteGlyph}>
              <X size={11} color={colors.inkDim} strokeWidth={2.6} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Key({
  children,
  onPress,
  label,
}: {
  children: ReactNode;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#E4E1D8',
    backgroundColor: 'transparent',
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
    marginBottom: 18,
    minHeight: 18,
  },
  errorSpacer: {
    height: 36,
  },
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  key: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  keyPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  digit: {
    fontSize: 26,
    color: colors.ink,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    lineHeight: 30,
  },
  letters: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: colors.inkDim,
    marginTop: 1,
  },
  sideKey: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bioLabel: {
    fontSize: 10,
    color: colors.inkDim,
  },
  deleteGlyph: {
    width: 24,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.inkDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
