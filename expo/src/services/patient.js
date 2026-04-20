import { apiRequest } from './apiClient';

function looksLikeJwt(value) {
  return typeof value === 'string' && value.split('.').length === 3;
}

function resolveToken(arg1, arg2) {
  // compatível com:
  // getPatientDashboard(token)
  // getPatientDashboard(userId, token)
  // getPatientDashboard({ token })
  if (arg2 && looksLikeJwt(arg2)) return arg2;
  if (arg1 && typeof arg1 === 'object' && looksLikeJwt(arg1.token)) return arg1.token;
  if (looksLikeJwt(arg1)) return arg1;
  return null;
}

export async function getPatientDashboard(arg1, arg2) {
  const token = resolveToken(arg1, arg2);

  const response = await apiRequest('/patient/dashboard', {
    method: 'GET',
    token,
  });

  if (!response?.ok || !response?.data?.ok) {
    console.log('PATIENT DASHBOARD RAW ERROR:', response?.data);
    throw new Error('patient/dashboard falhou');
  }

  return response.data;
}

export async function getLatestPatientHealth(arg1, arg2) {
  const data = await getPatientDashboard(arg1, arg2);
  const normalized = data?.data || data;

  return {
    ok: true,
    data: {
      ok: true,
      data: normalized?.latest || {},
    },
  };
}
