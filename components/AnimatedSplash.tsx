import { BrandLockup } from '@/components/BrandLockup';
import { colors } from '@/theme/colors';
import { StyleSheet, View } from 'react-native';

export function AnimatedSplash() {
  return (
    <View style={styles.wrap}>
      <BrandLockup animated />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
