import { apiRequest } from './apiClient';

export async function getDoctorPatients(token) {
  const response = await apiRequest('/doctors/patients', {
    method: 'GET',
    token,
  });

  if (!response?.ok || !response?.data?.ok) {
    throw new Error('Falha ao carregar pacientes');
  }

  return response.data.patients || [];
}
