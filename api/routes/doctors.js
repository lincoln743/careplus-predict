const { authGuard } = require('../middleware/authGuard');

module.exports = async function doctorsRoutes(fastify) {
  fastify.get('/doctors/patients', { preHandler: [authGuard] }, async (request, reply) => {
    try {
      const patients = [
        {
          id: 1,
          name: 'João Silva',
          age: 35,
          healthScore: 78,
          steps: 6500,
          sleep: 5.8,
          heartRate: 75,
          alerts: ['queda_ativ_fisica', 'sono_irregular'],
          status: 'offline',
          statusLabel: 'Offline',
          online: false,
          lastSeen: null,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Maria Santos',
          age: 32,
          healthScore: 92,
          steps: 11500,
          sleep: 7.2,
          heartRate: 68,
          alerts: [],
          status: 'offline',
          statusLabel: 'Offline',
          online: false,
          lastSeen: null,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Paciente Demo',
          age: 29,
          healthScore: 100,
          steps: 7200,
          sleep: 7.5,
          heartRate: 72,
          alerts: [],
          status: 'online',
          statusLabel: 'Online',
          online: true,
          lastSeen: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
        },
      ];

      return reply.send({
        ok: true,
        patients,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        ok: false,
        error: 'Erro ao carregar pacientes',
      });
    }
  });
};
