import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { ToastHost } from '@/components/ToastHost';
import { StoreProvider } from '@/lib/store';
import { colors } from '@/theme/colors';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});
try {
  SplashScreen.setOptions({ fade: true, duration: 250 });
} catch {
  // Native-only.
}

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

function RootNav() {
  const { status } = useAuth();
  const [held, setHeld] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => setHeld(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (status === 'loading' || !held) {
    return (
      <>
        <StatusBar style="dark" />
        <AnimatedSplash />
      </>
    );
  }

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
