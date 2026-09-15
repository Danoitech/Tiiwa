import { useAuth } from '@/auth/AuthProvider';
import { sendOtp, verifyOtp } from '@/auth/otp';
import { setPin } from '@/auth/pin';
import { PinPad } from '@/components/PinPad';
import { GhostButton, PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

function asString(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export function OtpScreen({ purpose }: { purpose: 'onboarding' | 'recovery' }) {
  const params = useLocalSearchParams<{ email?: string; devCode?: string }>();
  const email = asString(params.email).trim().toLowerCase();
  const devCode = asString(params.devCode);
  const { completeOnboarding, setEmail, unlock } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [firstPin, setFirstPin] = useState<string | null>(null);

  async function confirm() {
    if (!email || code.trim().length < 6) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await verifyOtp(email, code);
      if (!ok) {
        setError('That code is wrong or has expired.');
        return;
      }
      await setEmail(email, true);
      if (purpose === 'recovery') {
        setResetMode(true);
        return;
      }
      await completeOnboarding();
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!email) return;
    const result = await sendOtp(email, purpose);
    router.setParams({ devCode: result.devCode ?? '' });
  }

  async function onNewPin(pin: string) {
    if (!firstPin) {
      setFirstPin(pin);
      setError(null);
      return;
    }
    if (pin !== firstPin) {
      setFirstPin(null);
      setError('Those PINs did not match.');
      return;
    }
    await setPin(pin);
    unlock();
  }

  if (!email) {
    return (
      <Screen style={styles.wrap}>
        <Text style={styles.kicker}>{purpose === 'recovery' ? 'RECOVERY' : 'CHECK YOUR INBOX'}</Text>
        <Text style={styles.title}>Missing email</Text>
        <Text style={styles.body}>Go back and try Forgot PIN again.</Text>
        <GhostButton label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (resetMode) {
    return (
      <Screen style={styles.wrap}>
        <Text style={styles.kicker}>New PIN</Text>
        <Text style={styles.title}>{firstPin ? 'Confirm your PIN' : 'Choose a new 4-digit PIN'}</Text>
        <PinPad
          key={firstPin ? 'confirm' : 'choose'}
          onComplete={onNewPin}
          error={error}
          onInput={() => setError(null)}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.kicker}>Check your inbox</Text>
      <Text style={styles.title}>Enter the 6-digit code</Text>
      <Text style={styles.body}>Sent to {email}. The PIN still works offline after this.</Text>
      {devCode ? (
        <View style={styles.dev}>
          <Text style={styles.devText}>
            No email provider is configured yet, so use this setup code: {devCode}
          </Text>
        </View>
      ) : null}
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor={colors.inkDim}
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={busy ? 'Checking…' : 'Verify'} onPress={confirm} disabled={code.length < 6 || busy} />
      <GhostButton label="Resend code" onPress={resend} />
      {purpose === 'recovery' ? <GhostButton label="Back to PIN" onPress={() => router.back()} /> : null}
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
    marginBottom: 18,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 22,
    letterSpacing: 8,
    color: colors.ink,
    marginBottom: 18,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 12,
  },
  dev: {
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  devText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
});
