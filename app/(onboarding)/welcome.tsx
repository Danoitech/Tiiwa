import { PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { Moon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <Screen style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.icon}>
          <Moon size={34} color={colors.mint} />
        </View>
        <Text style={styles.kicker}>Tiiwa</Text>
        <Text style={styles.title}>A calm log for nights that do not stay still.</Text>
        <Text style={styles.body}>
          Feeds, sleep and nappies stay on this phone. No ads, no location, no photos. One or two taps when you need them.
        </Text>
      </View>
      <PrimaryButton label="Get started" onPress={() => router.push('/profile')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'flex-end',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.mintDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  kicker: {
    fontSize: 13,
    color: colors.mint,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '500',
    lineHeight: 34,
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: colors.inkDim,
    lineHeight: 22,
  },
});
