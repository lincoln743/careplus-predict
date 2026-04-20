const { authGuard } = require('../middleware/authGuard');

module.exports = async function patientRoutes(fastify) {
  fastify.get('/patient/dashboard', { preHandler: [authGuard] }, async (request, reply) => {
    try {
      return reply.send({
        ok: true,
        healthScore: 100,
        heartRate: 72,
        history: [
          { day: '2026-03-28', distance: 5.1, entries: 1, sleep: 7.5, steps: 7200 },
          { day: '2026-03-27', distance: 4.9, entries: 1, sleep: 7.2, steps: 6800 },
          { day: '2026-03-26', distance: 3.8, entries: 1, sleep: 6.9, steps: 5400 },
          { day: '2025-11-21', distance: 6.3, entries: 2, sleep: 7.4, steps: 9412 },
        ],
        latest: {
          distance: 5.1,
          sleep: 7.5,
          steps: 7200,
          ts: '2026-03-28 19:41:28',
          userId: 3,
        },
        progress: 90,
        recommendations: ['Manter rotina atual'],
        riskAnalysis: 'Baixo risco',
        sleep: 7.5,
        steps: 7200,
        data: {
          healthScore: 100,
          heartRate: 72,
          history: [
            { day: '2026-03-28', distance: 5.1, entries: 1, sleep: 7.5, steps: 7200 },
            { day: '2026-03-27', distance: 4.9, entries: 1, sleep: 7.2, steps: 6800 },
            { day: '2026-03-26', distance: 3.8, entries: 1, sleep: 6.9, steps: 5400 },
            { day: '2025-11-21', distance: 6.3, entries: 2, sleep: 7.4, steps: 9412 },
          ],
          latest: {
            distance: 5.1,
            sleep: 7.5,
            steps: 7200,
            ts: '2026-03-28 19:41:28',
            userId: 3,
          },
          progress: 90,
          recommendations: ['Manter rotina atual'],
          riskAnalysis: 'Baixo risco',
          sleep: 7.5,
          steps: 7200,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        ok: false,
        error: 'Erro ao carregar dashboard do paciente',
      });
    }
  });
};
