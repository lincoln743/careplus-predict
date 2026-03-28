import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@careplus_session';

export async function saveSession({ token, userId, userType }) {
  const payload = { token, userId, userType };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function getSession() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log('CLEAR SESSION ERROR:', error);
  }
}
