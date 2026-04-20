const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

async function authGuard(request, reply) {
  try {
    const authHeader = request.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return reply.code(401).send({
        ok: false,
        error: 'Token ausente ou inválido',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    request.user = {
      id: String(decoded.sub),
      email: decoded.email,
      userType: decoded.userType,
    };
  } catch (error) {
    return reply.code(401).send({
      ok: false,
      error: 'Token expirado ou inválido',
    });
  }
}

module.exports = { authGuard };
