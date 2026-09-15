import * as Crypto from 'expo-crypto';
import { deleteSecret, getSecret, setSecret } from '@/lib/secure';

const PIN_HASH = 'tiiwa.pin.hash';
const PIN_SALT = 'tiiwa.pin.salt';
const BIO_ENABLED = 'tiiwa.bio.enabled';

async function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function hasPin() {
  return Boolean(await getSecret(PIN_HASH));
}

export async function setPin(pin: string) {
  const salt = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}-${Math.random()}`
  );
  const hash = await hashPin(pin, salt);
  await setSecret(PIN_SALT, salt);
  await setSecret(PIN_HASH, hash);
}

export async function verifyPin(pin: string) {
  const salt = await getSecret(PIN_SALT);
  const hash = await getSecret(PIN_HASH);
  if (!salt || !hash) return false;
  return (await hashPin(pin, salt)) === hash;
}

export async function clearPin() {
  await deleteSecret(PIN_HASH);
  await deleteSecret(PIN_SALT);
}

export async function isBiometricsEnabled() {
  return (await getSecret(BIO_ENABLED)) === '1';
}

export async function setBiometricsEnabled(enabled: boolean) {
  await setSecret(BIO_ENABLED, enabled ? '1' : '0');
}
