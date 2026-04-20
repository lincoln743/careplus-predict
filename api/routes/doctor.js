const { authGuard } = require('../middleware/authGuard');

module.exports = async function doctorRoutes(fastify) {
  fastify.get('/doctor/me', { preHandler: [authGuard] }, async (request, reply) => {
    return reply.send({
      ok: true,
      doctor: {
        id: request.user.id,
        email: request.user.email,
        userType: request.user.userType,
      },
    });
  });
};
