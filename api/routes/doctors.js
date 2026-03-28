async function doctorsRoutes(fastify, options) {
  fastify.get('/doctors/patients', async (request, reply) => {
    try {
      return [
        {
          id: 1,
          name: 'João Silva',
          risk: 'low',
          score: 82,
          heartRate: 71,
        },
        {
          id: 2,
          name: 'Maria Souza',
          risk: 'high',
          score: 45,
          heartRate: 96,
        },
        {
          id: 3,
          name: 'Carlos Lima',
          risk: 'medium',
          score: 67,
          heartRate: 80,
        }
      ];
    } catch (err) {
      reply.status(500);
      return [];
    }
  });
}

module.exports = doctorsRoutes;
