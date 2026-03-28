const {
  getLatestHealthData,
  getDailyGroupedData
} = require('../health');

async function healthRoutes(fastify, options) {
  fastify.get('/health/latest', async (request, reply) => {
    try {
      const userId = Number(request.query.userId || 3);

      const latest = getLatestHealthData(userId);

      if (!latest) {
        reply.status(404);
        return {
          ok: false,
          error: 'Sem dados recentes'
        };
      }

      return {
        ok: true,
        data: latest
      };
    } catch (err) {
      reply.status(500);
      return {
        ok: false,
        error: 'Erro ao buscar latest'
      };
    }
  });

  fastify.get('/health/history/daily', async (request, reply) => {
    try {
      const userId = Number(request.query.userId || 3);

      const days = getDailyGroupedData(userId);

      if (!days || days.length === 0) {
        reply.status(404);
        return {
          ok: false,
          error: 'Sem histórico diário'
        };
      }

      return {
        ok: true,
        days,
        data: days
      };
    } catch (err) {
      reply.status(500);
      return {
        ok: false,
        error: 'Erro ao buscar histórico diário'
      };
    }
  });
}

module.exports = healthRoutes;
