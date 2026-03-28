async function getDoctorDashboard() {
  const patients = [
    { id: 1, name: 'João Silva', risk: 'low', score: 82, heartRate: 71 },
    { id: 2, name: 'Maria Souza', risk: 'high', score: 45, heartRate: 96 },
    { id: 3, name: 'Carlos Lima', risk: 'medium', score: 67, heartRate: 80 },
  ];

  const totalPatients = patients.length;
  const highRiskPatients = patients.filter(p => p.risk === 'high').length;
  const alertsCount = highRiskPatients;
  const averageScore = Math.round(
    patients.reduce((acc, p) => acc + p.score, 0) / totalPatients
  );

  return {
    totalPatients,
    highRiskPatients,
    alertsCount,
    averageScore,
    patients
  };
}

module.exports = {
  getDoctorDashboard
};
