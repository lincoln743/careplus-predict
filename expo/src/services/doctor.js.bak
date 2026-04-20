import { apiRequest } from './apiClient';

export async function getDoctorProfile(token, userId) {
  return apiRequest(`/doctors/${userId}`, {
    method: 'GET',
    token,
  });
}

export async function getDoctorPatients(token) {
  return apiRequest('/doctors/patients', {
    method: 'GET',
    token,
  });
}
