import { colors } from '@/theme/colors';
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function LockLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="recover-email" />
      <Stack.Screen name="recover" />
    </Stack>
  );
}
