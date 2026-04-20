const axios = require('axios');

async function aiRoutes(fastify) {
  fastify.post('/ai/predict', async (request, reply) => {
    try {
      const pyUrl = process.env.PY_AI_URL || 'http://127.0.0.1:8000/predict';

      const response = await axios.post(pyUrl, request.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      });

      return reply.send(response.data);
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        ok: false,
        error: 'Erro ao consultar IA',
        details: error?.response?.data || error.message,
      });
    }
  });
}

module.exports = aiRoutes;
