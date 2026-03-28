async function doctorRoutes(fastify, options) {
  fastify.get('/doctors/patients', async (request, reply) => {
    return [
      {
        id: 1,
        name: 'Pedro Oliveira',
        age: 38,
        score: 82,
        steps: 5432,
        sleep: 5.8,
        heartRate: 78,
        status: 'Alto Risco',
        alerts: ['Sono Insuficiente', 'Estresse Elevado'],
        online: true,
        lastUpdate: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Mariana Santos',
        age: 31,
        score: 67,
        steps: 7210,
        sleep: 6.9,
        heartRate: 72,
        status: 'Com Alertas',
        alerts: ['Baixa Atividade Física'],
        online: false,
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        name: 'Lucas Andrade',
        age: 29,
        score: 74,
        steps: 8044,
        sleep: 7.1,
        heartRate: 69,
        status: 'Acompanhamento',
        alerts: [],
        online: true,
        lastUpdate: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Renata Lima',
        age: 35,
        score: 91,
        steps: 9320,
        sleep: 7.8,
        heartRate: 70,
        status: 'Inativo',
        alerts: [],
        online: false,
        lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ];
  });
}

module.exports = doctorRoutes;
