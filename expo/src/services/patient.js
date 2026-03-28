import { apiRequest } from './apiClient';

export async function getPatientProfile(token, userId) {
  return apiRequest(`/patients/${userId}`, {
    method: 'GET',
    token,
  });
}

export async function getPatientMetrics(token, userId) {
  return apiRequest(`/patients/${userId}/metrics`, {
    method: 'GET',
    token,
  });
}

export async function getLatestPatientHealth(userId, token) {
  return apiRequest(`/health/latest?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    token,
  });
}
