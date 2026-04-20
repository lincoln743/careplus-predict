import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@careplus_session';

export async function saveSession(user) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export async function loadSession() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw);

  if (!parsed?.id || !parsed?.type || !parsed?.token) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return parsed;
}

export async function clearSession() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
