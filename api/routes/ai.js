const axios = require('axios');

async function aiRoutes(fastify, options) {
  fastify.post('/predict', async (request, reply) => {
    try {
      const { window } = request.body || {};

      if (!Array.isArray(window)) {
        return reply.code(400).send({
          ok: false,
          error: 'window ausente ou inválida'
        });
      }

      const pyUrl = process.env.PY_AI_URL || 'http://127.0.0.1:8000/predict';

      const response = await axios.post(
        pyUrl,
        { window },
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return reply.send({
        ok: true,
        source: 'python-ai',
        predicted_hr: response.data.predicted_hr
      });
    } catch (err) {
      request.log.error(err);

      const fallbackHr = 72;

      return reply.code(200).send({
        ok: true,
        source: 'fallback',
        predicted_hr: fallbackHr,
        warning: 'python-ai unavailable'
      });
    }
  });
}

module.exports = aiRoutes;
