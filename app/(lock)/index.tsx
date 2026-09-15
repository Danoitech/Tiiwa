import { useAuth } from '@/auth/AuthProvider';
import { sendOtp } from '@/auth/otp';
import { isBiometricsEnabled, verifyPin } from '@/auth/pin';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UnlockScreen() {
  const insets = useSafeAreaInsets();
  const { unlock, email } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [fails, setFails] = useState(0);
  const [bioReady, setBioReady] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const lockedOut = fails >= 5;

  useEffect(() => {
    (async () => {
      if (!(await isBiometricsEnabled())) return;
      setBioReady(true);
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

  async function onBiometrics() {
    if (!bioReady && !(await isBiometricsEnabled())) {
      Alert.alert('Face ID is off', 'Turn it on in Settings after you unlock with your PIN.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Tiiwa',
      disableDeviceFallback: true,
    });
    if (result.success) unlock();
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
        <Text style={styles.body}>Works offline. Face ID is optional in Settings.</Text>
      </View>
      <View style={styles.pad}>
        <PinPad
          onComplete={onComplete}
          error={lockedOut ? 'Too many attempts. Wait a moment, then try again.' : error}
          onBiometrics={onBiometrics}
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
