const JWT_SECRET = process.env.JWT_SECRET || 'careplus-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
