const axios = require('axios');

async function aiRoutes(fastify) {
  fastify.get('/health', async (request, reply) => {
    return reply.send({ ok: true, status: 'online', ts: new Date().toISOString() });
  });

  fastify.post('/ai/predict', async (request, reply) => {
    const pyUrl = process.env.PY_AI_URL;
    if (!pyUrl) {
      request.log.error('[ai/predict] PY_AI_URL nao configurado');
      return reply.code(503).send({ ok: false, error: 'IA nao configurada no servidor' });
    }
    try {
      const response = await axios.post(pyUrl, request.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      return reply.send(response.data);
    } catch (error) {
      request.log.error({ err: error.message }, '[ai/predict] Erro ao consultar IA');
      return reply.code(500).send({
        ok: false,
        error: 'Erro ao consultar IA',
        details: error?.response?.data || error.message,
      });
    }
  });
}

module.exports = aiRoutes;
