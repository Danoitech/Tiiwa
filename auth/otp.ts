import * as Crypto from 'expo-crypto';
import { deleteSecret, getSecret, setSecret } from '@/lib/secure';

const OTP_HASH = 'tiiwa.otp.hash';
const OTP_EXP = 'tiiwa.otp.exp';
const OTP_EMAIL = 'tiiwa.otp.email';

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashCode(email: string, code: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${email.toLowerCase()}:${code}`);
}

export async function sendOtp(email: string, purpose: 'onboarding' | 'recovery') {
  const normalized = email.trim().toLowerCase();
  const code = randomCode();
  const hash = await hashCode(normalized, code);
  await setSecret(OTP_HASH, hash);
  await setSecret(OTP_EXP, String(Date.now() + 10 * 60 * 1000));
  await setSecret(OTP_EMAIL, normalized);

  const endpoint = process.env.EXPO_PUBLIC_OTP_ENDPOINT;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, purpose, code }),
    });
    if (!response.ok) {
      throw new Error('Could not send the code. Try again.');
    }
    return { sent: true as const, devCode: null };
  }

  return { sent: false as const, devCode: code };
}

export async function verifyOtp(email: string, code: string) {
  const normalized = email.trim().toLowerCase();
  const storedEmail = await getSecret(OTP_EMAIL);
  const hash = await getSecret(OTP_HASH);
  const exp = Number((await getSecret(OTP_EXP)) ?? 0);
  if (!hash || storedEmail !== normalized) return false;
  if (Date.now() > exp) return false;
  const matches = (await hashCode(normalized, code.trim())) === hash;
  if (matches) {
    await deleteSecret(OTP_HASH);
    await deleteSecret(OTP_EXP);
  }
  return matches;
}
