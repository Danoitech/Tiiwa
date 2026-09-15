import { PrimaryButton, Screen } from '@/components/ui';
import { upsertBaby } from '@/db/queries';
import { useStore } from '@/lib/store';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileScreen() {
  const { refresh } = useStore();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [saving, setSaving] = useState(false);

  async function next() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await upsertBaby(trimmed, dob.trim() || null);
      refresh();
      router.push('/set-pin');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.kicker}>Baby profile</Text>
      <Text style={styles.title}>Who are we watching over?</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Milo"
        placeholderTextColor={colors.inkDim}
        style={styles.input}
        autoFocus
      />
      <Text style={styles.label}>Date of birth (optional)</Text>
      <TextInput
        value={dob}
        onChangeText={setDob}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.inkDim}
        style={styles.input}
        autoCapitalize="none"
      />
      <View style={{ flex: 1 }} />
      <PrimaryButton label={saving ? 'Saving…' : 'Continue'} onPress={next} disabled={!name.trim() || saving} />
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
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    color: colors.inkDim,
    marginBottom: 8,
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
});
