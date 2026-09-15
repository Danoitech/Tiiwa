import { sendOtp } from '@/auth/otp';
import { useAuth } from '@/auth/AuthProvider';
import { Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RecoverEmailScreen() {
  const { setEmail } = useAuth();
  const [email, setEmailValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function send() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const normalized = email.trim().toLowerCase();
      const result = await sendOtp(normalized, 'recovery');
      await setEmail(normalized, false);
      router.push({
        pathname: '/recover',
        params: { email: normalized, devCode: result.devCode ?? '' },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.kicker}>RECOVERY EMAIL</Text>
        <Text style={styles.title}>If you forget the PIN</Text>
        <Text style={styles.body}>
          Enter the email for this phone. We'll send a one-time code so you can choose a new PIN.
        </Text>
      </View>

      <View style={styles.field}>
        <Mail size={18} color={colors.inkDim} strokeWidth={1.8} />
        <TextInput
          value={email}
          onChangeText={(value) => {
            setEmailValue(value);
            if (error) setError(null);
          }}
          placeholder="you@email.com"
          placeholderTextColor={colors.inkDim}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          style={styles.input}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={send}
        disabled={!valid || busy}
        style={[styles.send, (!valid || busy) && styles.sendDisabled]}
      >
        <Text style={[styles.sendText, (!valid || busy) && styles.sendTextDisabled]}>
          {busy ? 'Sending…' : 'Send code'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Text style={styles.backText}>Back to PIN</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 20,
    marginBottom: 36,
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 0,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 10,
  },
  send: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
    marginTop: 16,
  },
  sendDisabled: {
    backgroundColor: colors.cardSoft,
  },
  sendText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.onAccent,
  },
  sendTextDisabled: {
    color: colors.ink,
  },
  back: {
    alignItems: 'center',
    marginTop: 28,
  },
  backText: {
    fontSize: 13,
    color: colors.inkDim,
  },
});
