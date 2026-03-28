import axios from 'axios';

const API_URL = 'http://192.168.0.200:3333';

export async function getDoctorPatients() {
  try {
    const response = await axios.get(`${API_URL}/doctors/patients`, {
      timeout: 10000,
    });

    const patients = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

    if (!patients.length) {
      throw new Error('API sem pacientes');
    }

    return {
      ok: true,
      patients,
      data: patients,
      list: patients,
    };
  } catch (error) {
    throw new Error('Falha na API');
  }
}

export async function getDoctorDashboard() {
  try {
    const response = await axios.get(`${API_URL}/doctor/dashboard`, {
      timeout: 10000,
    });

    const raw = response.data || {};
    const payload = raw.data || raw;

    const patients = Array.isArray(payload.patients)
      ? payload.patients
      : Array.isArray(raw.patients)
        ? raw.patients
        : [];

    if (!patients.length) {
      throw new Error('Lista vazia');
    }

    const result = {
      ok: true,
      totalPatients: payload.totalPatients ?? raw.totalPatients ?? patients.length,
      highRiskPatients:
        payload.highRiskPatients ??
        raw.highRiskPatients ??
        patients.filter((p) => p.risk === 'high').length,
      alertsCount:
        payload.alertsCount ??
        raw.alertsCount ??
        patients.filter((p) => p.risk === 'high').length,
      averageScore:
        payload.averageScore ??
        raw.averageScore ??
        Math.round(
          patients.reduce((acc, p) => acc + (p.score || 0), 0) / patients.length
        ),
      patients,
    };

    return {
      ...result,
      data: result,
    };
  } catch (error) {
    throw new Error('Falha na API');
  }
}

export async function getDoctorMetrics() {
  try {
    const dashboardResponse = await getDoctorDashboard();
    const dashboard = dashboardResponse?.data || dashboardResponse;

    if (!dashboard?.patients?.length) {
      throw new Error('Sem dados');
    }

    const result = {
      ok: true,
      totalPatients: dashboard.totalPatients,
      highRiskPatients: dashboard.highRiskPatients,
      alertsCount: dashboard.alertsCount,
      averageScore: dashboard.averageScore,
      patients: dashboard.patients,
    };

    return {
      ...result,
      data: result,
    };
  } catch (error) {
    throw new Error('Falha na API');
  }
}
