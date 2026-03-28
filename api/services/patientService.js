const { getLatestHealthData, getDailyGroupedData } = require('../health');

async function getPatientDashboard(userId) {
  const latest = getLatestHealthData(userId);
  const history = getDailyGroupedData(userId) || [];

  const latestSteps = latest?.steps ?? 0;
  const latestSleep = latest?.sleep ?? 0;

  const healthScore = latest
    ? Math.max(0, Math.min(100, Math.round((latestSteps / 100) + (latestSleep * 10))))
    : 0;

  const progress = Math.max(0, Math.min(100, Math.round((latestSteps / 8000) * 100)));

  const heartRate = 72;
  const riskAnalysis =
    healthScore >= 80 ? 'Baixo risco' :
    healthScore >= 50 ? 'Médio risco' :
    'Alto risco';

  const recommendations = [];
  if (latestSteps < 6000) recommendations.push('Aumentar número de passos diários');
  if (latestSleep < 7) recommendations.push('Melhorar rotina de sono');
  if (!recommendations.length) recommendations.push('Manter rotina atual');

  return {
    healthScore,
    heartRate,
    steps: latestSteps,
    sleep: latestSleep,
    progress,
    riskAnalysis,
    recommendations,
    latest,
    history
  };
}

module.exports = {
  getPatientDashboard
};
