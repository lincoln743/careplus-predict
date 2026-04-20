const Fastify = require('fastify');
const fastify = Fastify({ logger: true });
const authRoutes = require('./auth');
const healthRoutes = require('./routes/health');
const doctorRoutes = require('./routes/doctor');
const doctorsRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patient');
const aiRoutes = require('./routes/ai');

fastify.register(authRoutes);
fastify.register(healthRoutes);
fastify.register(doctorRoutes);
fastify.register(doctorsRoutes);
fastify.register(patientRoutes);
fastify.register(aiRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3333, host: '0.0.0.0' });
    console.log('Server rodando em http://0.0.0.0:3333');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
