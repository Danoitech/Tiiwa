import { getDb } from '@/db/client';
import { getBaby, getMeta, setMeta } from '@/db/queries';
import { seedHistoricalNotes } from '@/db/seed';
import { hasPin } from '@/auth/pin';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

export type AuthStatus = 'loading' | 'needs-onboarding' | 'locked' | 'ready';

type AuthContextValue = {
  status: AuthStatus;
  email: string | null;
  emailVerified: boolean;
  refreshAuth: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  setEmail: (email: string, verified: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [email, setEmailState] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const refreshAuth = useCallback(async () => {
    await getDb();
    const pinSet = await hasPin();
    const complete = (await getMeta('onboarding_complete')) === '1';
    const storedEmail = await getMeta('email');
    const verified = (await getMeta('email_verified')) === '1';
    setEmailState(storedEmail);
    setEmailVerified(verified);
    if (!pinSet || !complete) {
      setStatus('needs-onboarding');
      return;
    }
    const baby = await getBaby();
    if (baby) {
      await seedHistoricalNotes(baby.id);
    }
    setStatus((current) => (current === 'ready' ? 'ready' : 'locked'));
  }, []);

  useEffect(() => {
    refreshAuth().catch(() => setStatus('needs-onboarding'));
  }, [refreshAuth]);

  useEffect(() => {
    let backgroundedAt: number | null = null;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        backgroundedAt = Date.now();
      }
      if (next === 'active' && backgroundedAt && Date.now() - backgroundedAt > 2 * 60 * 1000) {
        setStatus((current) => (current === 'ready' ? 'locked' : current));
      }
    });
    return () => sub.remove();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setMeta('onboarding_complete', '1');
    const baby = await getBaby();
    if (baby) {
      await seedHistoricalNotes(baby.id);
    }
    setStatus('ready');
  }, []);

  const unlock = useCallback(() => setStatus('ready'), []);
  const lock = useCallback(() => setStatus('locked'), []);

  const setEmail = useCallback(async (next: string, verified: boolean) => {
    await setMeta('email', next.trim().toLowerCase());
    await setMeta('email_verified', verified ? '1' : '0');
    setEmailState(next.trim().toLowerCase());
    setEmailVerified(verified);
  }, []);

  const value = useMemo(
    () => ({ status, email, emailVerified, refreshAuth, completeOnboarding, unlock, lock, setEmail }),
    [status, email, emailVerified, refreshAuth, completeOnboarding, unlock, lock, setEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
