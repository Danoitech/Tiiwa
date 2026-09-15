import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { ToastHost } from '@/components/ToastHost';
import { StoreProvider } from '@/lib/store';
import { colors } from '@/theme/colors';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});
try {
  SplashScreen.setOptions({ fade: true, duration: 400 });
} catch {
  // Native-only.
}

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

function RootNav() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'loading') return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={status === 'needs-onboarding'}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={status === 'locked'}>
          <Stack.Screen name="(lock)" />
        </Stack.Protected>

        <Stack.Protected guard={status === 'ready'}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="log" options={{ presentation: 'modal' }} />
          <Stack.Screen name="sleep" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <AuthProvider>
        <RootNav />
      </AuthProvider>
    </StoreProvider>
  );
}
