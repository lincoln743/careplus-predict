const db = require('./db');
const bcrypt = require('bcrypt');

async function authRoutes(fastify, options) {
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      const user = db.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).get(email);

      console.log('AUTH USER:', user);

      if (!user) {
        reply.status(401);
        return { ok: false, error: 'Usuário ou senha inválidos' };
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        reply.status(401);
        return { ok: false, error: 'Usuário ou senha inválidos' };
      }

      const userType =
        user.role ||
        user.type ||
        user.userType ||
        user.profile;

      const response = {
        ok: true,
        email: user.email,
        token: 'fake-jwt-token-v2',
        userId: user.id,
        userType,
        debugVersion: 'auth-v3',
      };

      console.log('AUTH RESPONSE:', response);
      return response;
    } catch (err) {
      console.log('AUTH ERROR:', err);
      reply.status(500);
      return { ok: false, error: 'Erro no login' };
    }
  });
}

module.exports = authRoutes;
