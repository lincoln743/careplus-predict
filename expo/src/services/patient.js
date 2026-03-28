import axios from 'axios';

const API_URL = 'http://192.168.0.200:3333';

async function fetchPatientDashboard(userId = 3) {
  try {
    const response = await axios.get(`${API_URL}/patient/dashboard`, {
      params: { userId },
      timeout: 10000,
    });

    console.log('PATIENT DASHBOARD STATUS:', response.status);
    console.log('PATIENT DASHBOARD RESPONSE:', response.data);

    const raw = response.data || {};
    const payload = raw.data || raw;

    return payload;
  } catch (error) {
    console.log('PATIENT DASHBOARD RAW ERROR:', error?.response?.data || error.message);
    throw new Error('patient/dashboard falhou');
  }
}

export async function getPatientDashboard(userId = 3, token = null) {
  const payload = await fetchPatientDashboard(userId);

  return {
    ok: true,
    healthScore: payload.healthScore ?? 0,
    heartRate: payload.heartRate ?? 72,
    steps: payload.steps ?? 0,
    sleep: payload.sleep ?? 0,
    progress: payload.progress ?? 0,
    riskAnalysis: payload.riskAnalysis ?? 'Sem análise',
    recommendations: payload.recommendations ?? [],
    latest: payload.latest ?? null,
    history: payload.history ?? [],
    data: payload,
  };
}

export async function getLatestPatientHealth(userId = 3, token = null) {
  const dashboard = await getPatientDashboard(userId, token);

  const result = {
    ok: true,
    userId,
    heartRate: dashboard.heartRate,
    steps: dashboard.steps,
    sleep: dashboard.sleep,
    healthScore: dashboard.healthScore,
    progress: dashboard.progress,
    riskAnalysis: dashboard.riskAnalysis,
    recommendations: dashboard.recommendations,
  };

  return {
    ...result,
    data: result,
  };
}

export async function getPatientMetrics(userId = 3, token = null) {
  const dashboard = await getPatientDashboard(userId, token);

  const result = {
    ok: true,
    heartRate: dashboard.heartRate,
    steps: dashboard.steps,
    sleep: dashboard.sleep,
    progress: dashboard.progress,
    healthScore: dashboard.healthScore,
  };

  return {
    ...result,
    data: result,
  };
}

export async function getPatientHealthHistory(userId = 3, token = null) {
  const dashboard = await getPatientDashboard(userId, token);

  const history = Array.isArray(dashboard.history) ? dashboard.history : [];

  if (!history.length) {
    throw new Error('Sem histórico diário');
  }

  return {
    ok: true,
    days: history,
    data: history,
  };
}

export async function getDailyPatientHistory(userId = 3, token = null) {
  return getPatientHealthHistory(userId, token);
}

export async function getPatientDailyHistory(userId = 3, token = null) {
  return getPatientHealthHistory(userId, token);
}

export async function getLatestHealth(userId = 3, token = null) {
  return getLatestPatientHealth(userId, token);
}

export async function getDailyHistory(userId = 3, token = null) {
  return getPatientHealthHistory(userId, token);
}
