const { getPatientDashboard } = require('../services/patientService');

async function patientRoutes(fastify, options) {
  fastify.get('/patient/dashboard', async (request, reply) => {
    try {
      const userId = Number(request.query.userId || 3);
      const data = await getPatientDashboard(userId);

      return {
        ok: true,
        data,
        ...data
      };
    } catch (err) {
      console.log('PATIENT DASHBOARD ERROR:', err);
      reply.status(500);
      return {
        ok: false,
        error: 'Erro ao gerar dashboard do paciente'
      };
    }
  });
}

module.exports = patientRoutes;
