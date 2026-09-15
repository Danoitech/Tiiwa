import { useAuth } from '@/auth/AuthProvider';
import { sendOtp } from '@/auth/otp';
import { GhostButton, PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function EmailScreen() {
  const { completeOnboarding, setEmail } = useAuth();
  const [email, setEmailValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function skip() {
    setBusy(true);
    try {
      await completeOnboarding();
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const result = await sendOtp(email, 'onboarding');
      await setEmail(email, false);
      router.push({
        pathname: '/otp',
        params: { email: email.trim().toLowerCase(), purpose: 'onboarding', devCode: result.devCode ?? '' },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.kicker}>Recovery email</Text>
      <Text style={styles.title}>If you forget the PIN</Text>
      <Text style={styles.body}>
        We only use this to send a one-time code. Daily unlock is still the PIN, and it works offline.
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmailValue}
        placeholder="you@email.com"
        placeholderTextColor={colors.inkDim}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={busy ? 'Sending…' : 'Send code'} onPress={send} disabled={!valid || busy} />
      <GhostButton label="Skip for now" onPress={skip} />
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
    marginBottom: 22,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 12,
  },
});
