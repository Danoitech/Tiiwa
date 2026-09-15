import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/ui';
import { setPin } from '@/auth/pin';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function SetPinScreen() {
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onComplete(pin: string) {
    if (!first) {
      setFirst(pin);
      setError(null);
      return;
    }
    if (pin !== first) {
      setFirst(null);
      setError('Those PINs did not match. Try again.');
      return;
    }
    await setPin(pin);
    router.push('/email');
  }

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.kicker}>Device lock</Text>
      <Text style={styles.title}>{first ? 'Confirm your PIN' : 'Choose a 4-digit PIN'}</Text>
      <Text style={styles.body}>
        This stays on the phone and unlocks Tiiwa when you open it. You will not need email at 4am.
      </Text>
      <PinPad onComplete={onComplete} error={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  kicker: {
    fontSize: 12,
    color: colors.inkDim,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    color: colors.ink,
    fontWeight: '500',
    marginTop: 6,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
    marginBottom: 28,
  },
});
