const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./config/jwt');

module.exports = async function authRoutes(fastify) {
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body || {};

      const users = [
        {
          id: 3,
          email: 'paciente@careplus.com',
          password: '123456',
          userType: 'patient',
        },
        {
          id: 4,
          email: 'medico@careplus.com',
          password: '123456',
          userType: 'doctor',
        },
      ];

      const user = users.find(
        (u) => u.email === String(email || '').trim() && u.password === String(password || '')
      );

      if (!user) {
        return reply.code(401).send({
          ok: false,
          error: 'Usuário ou senha inválidos',
        });
      }

      const token = jwt.sign(
        {
          email: user.email,
          userType: user.userType,
        },
        JWT_SECRET,
        {
          subject: String(user.id),
          expiresIn: JWT_EXPIRES_IN,
        }
      );

      return reply.send({
        ok: true,
        token,
        userId: user.id,
        userType: user.userType,
        email: user.email,
        debugVersion: 'auth-jwt-v1',
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        ok: false,
        error: 'Erro interno no login',
      });
    }
  });
};
