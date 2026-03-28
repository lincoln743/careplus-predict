const { getDoctorDashboard } = require('../services/doctorService');

async function doctorRoutes(fastify, options) {
  fastify.get('/doctor/dashboard', async (request, reply) => {
    try {
      const data = await getDoctorDashboard();

      return {
        ok: true,
        data,
        totalPatients: data.totalPatients,
        highRiskPatients: data.highRiskPatients,
        alertsCount: data.alertsCount,
        averageScore: data.averageScore,
        patients: data.patients
      };
    } catch (err) {
      reply.status(500);
      return {
        ok: false,
        error: 'Erro ao gerar dashboard do médico',
        patients: []
      };
    }
  });
}

module.exports = doctorRoutes;
