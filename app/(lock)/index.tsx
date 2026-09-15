import { alertBiometricFailure, biometricLabel, getBiometricKind, promptBiometrics } from '@/auth/biometrics';
import { useAuth } from '@/auth/AuthProvider';
import { sendOtp } from '@/auth/otp';
import { isBiometricsEnabled, setBiometricsEnabled, verifyPin } from '@/auth/pin';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UnlockScreen() {
  const insets = useSafeAreaInsets();
  const { unlock, email } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [fails, setFails] = useState(0);
  const [recovering, setRecovering] = useState(false);
  const [bioLabel, setBioLabel] = useState('Face ID');
  const lockedOut = fails >= 5;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const kind = await getBiometricKind();
      if (!cancelled) setBioLabel(biometricLabel(kind));

      if (!(await isBiometricsEnabled())) return;
      const result = await promptBiometrics(`Unlock Tiiwa with ${biometricLabel(kind)}`);
      if (cancelled) return;
      if (result.success) {
        unlock();
        return;
      }
      alertBiometricFailure(result.error);
    })();

    return () => {
      cancelled = true;
    };
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

  async function onBiometrics() {
    const result = await promptBiometrics(`Unlock Tiiwa with ${bioLabel}`);
    if (result.success) {
      await setBiometricsEnabled(true);
      unlock();
      return;
    }
    alertBiometricFailure(result.error);
  }

  async function forgot() {
    if (recovering) return;
    setRecovering(true);
    setError(null);
    try {
      if (!email) {
        router.push('/recover-email');
        return;
      }
      const result = await sendOtp(email, 'recovery');
      router.push({
        pathname: '/recover',
        params: { email, devCode: result.devCode ?? '' },
      });
    } catch (e) {
      Alert.alert('Could not start recovery', e instanceof Error ? e.message : 'Try again in a moment.');
    } finally {
      setRecovering(false);
    }
  }

  return (
    <Screen style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.kicker}>DEVICE LOCK</Text>
        <Text style={styles.title}>Enter your PIN</Text>
        <Text style={styles.body}>Works offline. {bioLabel} unlocks Tiiwa on this phone.</Text>
      </View>
      <View style={styles.pad}>
        <PinPad
          onComplete={onComplete}
          error={lockedOut ? 'Too many attempts. Wait a moment, then try again.' : error}
          onBiometrics={onBiometrics}
          biometricsLabel={bioLabel}
          disabled={lockedOut}
          onInput={() => setError(null)}
        />
      </View>
      <Pressable
        onPress={forgot}
        disabled={recovering}
        hitSlop={12}
        style={[styles.forgot, { marginBottom: Math.max(insets.bottom, 12) }]}
      >
        <Text style={styles.forgotText}>{recovering ? 'Sending code…' : 'Forgot PIN'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 28,
    paddingBottom: 4,
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
    minHeight: 0,
  },
  forgot: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mint,
  },
});
