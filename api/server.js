const fastify = require('fastify')({ logger: true });
const aiRoutes = require('./routes/ai');
const cors = require('@fastify/cors');
const doctorRoutes = require('./routes/doctors');
const {
  saveHealthData,
  getLatestHealthData,
  getAllHealthData,
  getDailyGroupedData
} = require('./health');
const { registerUser, loginUser } = require('./auth');

async function start() {
  await fastify.register(cors, { origin: "*" });

  fastify.register(aiRoutes, { prefix: '/ai' });
  fastify.register(doctorRoutes);

  fastify.get("/ping", async () => {
    return { status: "API Online", ts: new Date().toISOString() };
  });

  fastify.post("/auth/register", async (req, reply) => {
    const { email, password, type } = req.body;

    try {
      const user = await registerUser(email, password, type);
      return { ok: true, user };
    } catch (err) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post("/auth/login", async (req, reply) => {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    if (!result) {
      return reply.status(401).send({ ok: false, error: "Invalid credentials" });
    }

    const type =
      email === "medico@careplus.com" ? "doctor" : "patient";

    const id =
      type === "doctor" ? 2 : 3;

    return {
      ok: true,
      token: result.token,
      id,
      type
    };
  });

  fastify.post("/health/send", async (req, reply) => {
    const { userId, steps, distance, sleep } = req.body;

    if (!userId)
      return reply.status(400).send({ ok: false, error: "userId obrigatório" });

    try {
      saveHealthData({ userId, steps, distance, sleep });
      return { ok: true, received: req.body };
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Erro ao salvar" });
    }
  });

  fastify.get("/health/latest", async (req, reply) => {
    const { userId } = req.query;
    if (!userId)
      return reply.status(400).send({ ok: false, error: "userId obrigatório" });

    const result = getLatestHealthData(userId);
    return { ok: true, data: result || null };
  });

  fastify.get("/health/all", async (req, reply) => {
    const { userId } = req.query;
    if (!userId)
      return reply.status(400).send({ ok: false, error: "userId obrigatório" });

    const rows = getAllHealthData(userId);
    return { ok: true, rows };
  });

  // ===============================
  // NOVO ENDPOINT: AGRUPAMENTO DIÁRIO
  // ===============================
  fastify.get("/health/history/daily", async (req, reply) => {
    const { userId } = req.query;

    if (!userId)
      return reply.status(400).send({ ok: false, error: "userId obrigatório" });

    const days = getDailyGroupedData(userId);
    return { ok: true, days };
  });

  await fastify.listen({ port: 3333, host: "0.0.0.0" });
}
start();


