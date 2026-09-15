import { useAuth } from '@/auth/AuthProvider';
import { sendOtp } from '@/auth/otp';
import { isBiometricsEnabled, verifyPin } from '@/auth/pin';
import { PinPad } from '@/components/PinPad';
import { GhostButton, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function UnlockScreen() {
  const { unlock, email, emailVerified } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [fails, setFails] = useState(0);
  const lockedOut = fails >= 5;

  useEffect(() => {
    (async () => {
      if (!(await isBiometricsEnabled())) return;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Tiiwa',
        disableDeviceFallback: true,
      });
      if (result.success) unlock();
    })();
  }, [unlock]);

  async function onComplete(pin: string) {
    if (lockedOut) return;
    const ok = await verifyPin(pin);
    if (ok) {
      setFails(0);
      unlock();
      return;
    }
    setFails((n) => n + 1);
    setError('Incorrect PIN');
  }

  async function forgot() {
    if (!email || !emailVerified) {
      setError('No recovery email is set on this phone.');
      return;
    }
    const result = await sendOtp(email, 'recovery');
    router.push({
      pathname: '/recover',
      params: { email, purpose: 'recovery', devCode: result.devCode ?? '' },
    });
  }

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.kicker}>Tiiwa</Text>
      <Text style={styles.title}>Enter your PIN</Text>
      <Text style={styles.body}>Works offline. Face ID is optional in Settings.</Text>
      <PinPad onComplete={onComplete} error={lockedOut ? 'Too many attempts. Wait a moment, then try again.' : error} />
      <GhostButton label="Forgot PIN" onPress={forgot} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  kicker: {
    fontSize: 13,
    color: colors.mint,
    fontWeight: '500',
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
    marginBottom: 28,
  },
});
