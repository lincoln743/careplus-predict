async function legacyRoutes(fastify, options) {
  fastify.get('/health/latest', async (request, reply) => {
    const userId = Number(request.query.userId || 3);

    return {
      userId,
      heartRate: 72,
      steps: 6840,
      sleep: 7.3,
      healthScore: 84,
      progress: 76,
      riskAnalysis: 'Baixo risco',
      recommendations: [
        'Manter rotina de sono',
        'Aumentar hidratação',
        'Continuar atividade física moderada'
      ],
      updatedAt: new Date().toISOString(),
    };
  });

  fastify.get('/health/history/daily', async (request, reply) => {
    const today = new Date();

    const days = Array.from({ length: 7 }).map((_, index) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - index));

      return {
        date: d.toISOString().slice(0, 10),
        heartRate: 68 + index,
        steps: 4200 + index * 900,
        sleep: Number((6.4 + index * 0.15).toFixed(1)),
        score: 72 + index * 2,
      };
    });

    return {
      days,
      data: days,
    };
  });

  fastify.get('/doctors/patients', async (request, reply) => {
    return [
      {
        id: 1,
        name: 'João Silva',
        risk: 'low',
        score: 82,
        heartRate: 71,
      },
      {
        id: 2,
        name: 'Maria Souza',
        risk: 'high',
        score: 45,
        heartRate: 96,
      },
      {
        id: 3,
        name: 'Carlos Lima',
        risk: 'medium',
        score: 67,
        heartRate: 80,
      },
    ];
  });
}

module.exports = legacyRoutes;
