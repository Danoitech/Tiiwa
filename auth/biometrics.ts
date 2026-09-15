import * as LocalAuthentication from 'expo-local-authentication';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

export type BiometricKind = 'face' | 'fingerprint' | 'none';

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export async function getBiometricKind(): Promise<BiometricKind> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  return 'none';
}

export function biometricLabel(kind: BiometricKind) {
  if (kind === 'fingerprint') return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  return 'Face ID';
}

export async function canUseBiometrics() {
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hardware && enrolled;
}

export async function promptBiometrics(promptMessage: string) {
  const available = await canUseBiometrics();
  if (!available) {
    return { success: false as const, error: 'not_available' as const };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Use PIN',
    disableDeviceFallback: false,
  });

  if (result.success) return { success: true as const };
  return { success: false as const, error: result.error };
}

export function explainBiometricFailure(error?: string) {
  if (!error || error === 'user_cancel' || error === 'system_cancel' || error === 'app_cancel') {
    return null;
  }

  if (error === 'not_available' || error === 'passcode_not_set') {
    if (Platform.OS === 'ios' && isExpoGo()) {
      return 'Expo Go cannot use Face ID. Unlock with your PIN, or install a Tiiwa development build to use Face ID.';
    }
    return 'Set up Face ID or a fingerprint on this device first.';
  }

  if (error === 'not_enrolled') {
    return 'Set up Face ID or a fingerprint on this device first.';
  }

  if (error === 'lockout') {
    return 'Too many Face ID attempts. Unlock with your PIN, then try Face ID again.';
  }

  return 'Face ID did not work. Use your PIN.';
}

export function alertBiometricFailure(error?: string) {
  const message = explainBiometricFailure(error);
  if (message) Alert.alert('Face ID', message);
}
