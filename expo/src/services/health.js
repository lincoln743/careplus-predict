import { getPatientDashboard, getPatientMetrics, getPatientHealthHistory } from './patient';

export async function getLatestHealth(userId) {
  return getPatientMetrics(userId);
}

export async function getDailyHistory(userId) {
  return getPatientHealthHistory(userId);
}

export async function getDashboardHealth(userId) {
  return getPatientDashboard(userId);
}
