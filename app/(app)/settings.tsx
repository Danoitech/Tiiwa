import { alertBiometricFailure, biometricLabel, getBiometricKind, promptBiometrics } from '@/auth/biometrics';
import { useAuth } from '@/auth/AuthProvider';
import { isBiometricsEnabled, setBiometricsEnabled } from '@/auth/pin';
import { Screen } from '@/components/ui';
import { exportCsv, upsertBaby } from '@/db/queries';
import { useBaby } from '@/hooks/useBaby';
import { useStore } from '@/lib/store';
import { toast } from '@/lib/toast';
import { colors } from '@/theme/colors';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Download, Fingerprint, Lock, Shield, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export default function SettingsScreen() {
  const baby = useBaby();
  const { refresh } = useStore();
  const { email, emailVerified, lock } = useAuth();
  const [bio, setBio] = useState(false);
  const [bioLabel, setBioLabel] = useState('Face ID');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    isBiometricsEnabled().then(setBio);
    getBiometricKind().then((kind) => setBioLabel(biometricLabel(kind)));
    if (baby) {
      setName(baby.name);
      setDob(baby.date_of_birth ?? '');
    }
  }, [baby]);

  async function toggleBio(next: boolean) {
    if (next) {
      const result = await promptBiometrics(`Enable ${bioLabel} for Tiiwa`);
      if (!result.success) {
        alertBiometricFailure(result.error);
        return;
      }
    }
    await setBiometricsEnabled(next);
    setBio(next);
  }

  async function saveProfile() {
    if (!name.trim()) return;
    await upsertBaby(name.trim(), dob.trim() || null);
    refresh();
    setEditing(false);
    toast('Profile saved');
  }

  async function shareCsv() {
    if (!baby) return;
    try {
      const csv = await exportCsv(baby.id);
      const file = new File(Paths.cache, 'tiiwa-export.csv');
      file.create({ overwrite: true });
      await file.write(csv);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
      } else {
        toast('CSV saved on this device');
      }
    } catch {
      toast('Could not export CSV');
    }
  }

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>Settings</Text>

        <Pressable style={styles.row} onPress={() => setEditing((v) => !v)}>
          <User size={16} color={colors.inkDim} />
          <Text style={styles.rowLabel}>{baby ? `${baby.name}'s profile` : 'Baby profile'}</Text>
        </Pressable>
        {editing ? (
          <View style={styles.edit}>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" placeholderTextColor={colors.inkDim} />
            <TextInput value={dob} onChangeText={setDob} style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.inkDim} />
            <Pressable onPress={saveProfile}><Text style={styles.link}>Save profile</Text></Pressable>
          </View>
        ) : null}

        <Pressable style={styles.row} onPress={shareCsv}>
          <Download size={16} color={colors.inkDim} />
          <Text style={styles.rowLabel}>Export data as CSV</Text>
        </Pressable>

        <View style={styles.row}>
          <Fingerprint size={16} color={colors.inkDim} />
          <Text style={styles.rowLabel}>Unlock with {bioLabel}</Text>
          <Switch value={bio} onValueChange={toggleBio} trackColor={{ true: colors.mint }} />
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Lock size={16} color={colors.inkDim} />
          <Text style={styles.rowLabel}>
            {emailVerified && email ? `Recovery: ${email}` : 'No recovery email yet'}
          </Text>
        </View>

        <View style={styles.privacy}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={16} color={colors.inkDim} />
            <Text style={styles.privacyTitle}>Privacy</Text>
          </View>
          <Text style={styles.privacyBody}>
            Logs stay on this phone. Tiiwa does not collect address, location, photos or advertising IDs. Cloud sync is not enabled.
          </Text>
        </View>

        <Pressable onPress={lock} style={{ marginTop: 18 }}>
          <Text style={styles.lockNow}>Lock now</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 17,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  edit: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    color: colors.ink,
  },
  link: {
    color: colors.mint,
    fontSize: 13,
    fontWeight: '500',
  },
  privacy: {
    marginTop: 24,
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    padding: 14,
  },
  privacyTitle: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '500',
  },
  privacyBody: {
    fontSize: 12,
    color: colors.inkDim,
    lineHeight: 18,
  },
  lockNow: {
    color: colors.inkDim,
    fontSize: 13,
    textAlign: 'center',
  },
});
