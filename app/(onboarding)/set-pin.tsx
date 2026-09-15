import { setBiometricsEnabled, setPin } from '@/auth/pin';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

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

  async function onBiometrics() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) {
      Alert.alert(
        'Face ID unavailable',
        'Set up Face ID or a fingerprint on this device first. You can turn it on later in Settings.'
      );
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Use Face ID with Tiiwa',
      disableDeviceFallback: true,
    });
    if (result.success) await setBiometricsEnabled(true);
  }

  return (
    <Screen style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.kicker}>DEVICE LOCK</Text>
        <Text style={styles.title}>{first ? 'Confirm your PIN' : 'Choose a 4-digit PIN'}</Text>
        <Text style={styles.body}>
          This stays on the phone and unlocks Tiiwa when you open it. You won't need email at 4am.
        </Text>
      </View>
      <View style={styles.pad}>
        <PinPad
          key={first ? 'confirm' : 'choose'}
          onComplete={onComplete}
          error={error}
          onBiometrics={onBiometrics}
          onInput={() => setError(null)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
  header: {
    paddingTop: 20,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.inkDim,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: colors.inkDim,
    lineHeight: 22,
    maxWidth: 320,
  },
  pad: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 8,
  },
});
