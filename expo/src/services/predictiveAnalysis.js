class PredictiveAnalysis {
  constructor() {
    this.riskThresholds = {
      steps: {
        low: 5000,
        medium: 7500,
        high: 10000
      },
      sleep: {
        low: 5,
        medium: 6,
        high: 7
      },
      consistency: {
        low: 0.6,
        medium: 0.8,
        high: 0.9
      }
    };
  }

  // Analisar tendência de passos
  analyzeStepsTrend(stepsData) {
    if (!stepsData || stepsData.length < 7) {
      return this.getMockAnalysis();
    }

    const recentSteps = stepsData.slice(-7).map(day => day.steps);
    const averageSteps = recentSteps.reduce((a, b) => a + b, 0) / recentSteps.length;
    
    // Calcular variabilidade (coeficiente de variação)
    const variance = recentSteps.reduce((acc, val) => acc + Math.pow(val - averageSteps, 2), 0) / recentSteps.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / averageSteps;

    // Tendência (regressão linear simples)
    const n = recentSteps.length;
    const xSum = recentSteps.reduce((acc, _, idx) => acc + idx, 0);
    const ySum = recentSteps.reduce((acc, val) => acc + val, 0);
    const xySum = recentSteps.reduce((acc, val, idx) => acc + idx * val, 0);
    const xSquaredSum = recentSteps.reduce((acc, _, idx) => acc + idx * idx, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    const trend = slope > 50 ? 'increasing' : slope < -50 ? 'decreasing' : 'stable';

    // Calcular risco
    let riskLevel = 'low';
    let riskScore = 0;

    if (averageSteps < this.riskThresholds.steps.low) {
      riskLevel = 'high';
      riskScore = 80 + (this.riskThresholds.steps.low - averageSteps) / 100;
    } else if (averageSteps < this.riskThresholds.steps.medium) {
      riskLevel = 'medium';
      riskScore = 40 + (this.riskThresholds.steps.medium - averageSteps) / 50;
    } else {
      riskLevel = 'low';
      riskScore = Math.max(0, 20 - (averageSteps - this.riskThresholds.steps.high) / 100);
    }

    // Ajustar baseado na consistência
    const consistencyScore = 1 - coefficientOfVariation;
    if (consistencyScore < this.riskThresholds.consistency.low) {
      riskScore += 20;
      riskLevel = this.upgradeRiskLevel(riskLevel);
    }

    return {
      riskLevel,
      riskScore: Math.min(100, Math.round(riskScore)),
      averageSteps: Math.round(averageSteps),
      trend,
      trendStrength: Math.abs(slope),
      consistency: Math.round(consistencyScore * 100),
      recommendations: this.generateRecommendations(averageSteps, trend, riskLevel, consistencyScore),
      insights: this.generateInsights(averageSteps, trend, coefficientOfVariation)
    };
  }

  // Analisar padrão de sono (usando dados mockados por enquanto)
  analyzeSleepPattern(sleepData) {
    // Mock - implementar com dados reais depois
    const averageSleep = 6.5;
    const consistency = 0.7;
    
    let riskLevel = 'medium';
    let riskScore = 50;

    if (averageSleep < 5) {
      riskLevel = 'high';
      riskScore = 80;
    } else if (averageSleep >= 7) {
      riskLevel = 'low';
      riskScore = 20;
    }

    return {
      riskLevel,
      riskScore,
      averageSleep,
      consistency: Math.round(consistency * 100),
      recommendations: [
        averageSleep < 6 ? 'Tente dormir pelo menos 7 horas por noite' : 'Seu padrão de sono está bom',
        'Estabeleça uma rotina regular de sono',
        'Evite telas 1 hora antes de dormir'
      ],
      insights: [
        `Média de sono: ${averageSleep}h por noite`,
        consistency < 0.8 ? 'Sono irregular detectado' : 'Padrão de sono consistente'
      ]
    };
  }

  // Detectar possível burnout baseado em múltiplos fatores
  detectBurnoutRisk(stepsAnalysis, sleepAnalysis, heartRateData) {
    const factors = [];
    let totalScore = 0;

    // Fator atividade física
    if (stepsAnalysis.riskLevel === 'high') {
      factors.push('Baixa atividade física');
      totalScore += 30;
    } else if (stepsAnalysis.riskLevel === 'medium') {
      totalScore += 15;
    }

    // Fator sono
    if (sleepAnalysis.riskLevel === 'high') {
      factors.push('Privação de sono');
      totalScore += 30;
    } else if (sleepAnalysis.riskLevel === 'medium') {
      totalScore += 15;
    }

    // Fator consistência
    if (stepsAnalysis.consistency < 70) {
      factors.push('Rotina irregular');
      totalScore += 20;
    }

    // Determinar nível de risco
    let riskLevel = 'low';
    if (totalScore >= 50) riskLevel = 'high';
    else if (totalScore >= 25) riskLevel = 'medium';

    return {
      riskLevel,
      riskScore: totalScore,
      factors,
      recommendations: this.generateBurnoutRecommendations(riskLevel, factors),
      urgency: riskLevel === 'high' ? 'immediate' : riskLevel === 'medium' ? 'soon' : 'monitor'
    };
  }

  upgradeRiskLevel(currentLevel) {
    const levels = ['low', 'medium', 'high'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, 2)];
  }

  generateRecommendations(averageSteps, trend, riskLevel, consistency) {
    const recommendations = [];

    if (averageSteps < 5000) {
      recommendations.push('⚡️ Tente aumentar para pelo menos 5,000 passos diários');
      recommendations.push('🚶‍♂️ Inclua caminhadas curtas durante o dia');
    } else if (averageSteps < 7500) {
      recommendations.push('🎯 Bom progresso! Meta: 10,000 passos diários');
      recommendations.push('🏃‍♂️ Adicione atividades mais intensas 3x por semana');
    } else {
      recommendations.push('🎉 Excelente! Mantenha essa rotina ativa');
      recommendations.push('💪 Considere desafios mais avançados');
    }

    if (trend === 'decreasing') {
      recommendations.push('📉 Atenção: atividade em declínio. Reveja sua rotina');
    }

    if (consistency < 0.7) {
      recommendations.push('🔄 Tente manter uma rotina mais consistente');
    }

    return recommendations;
  }

  generateInsights(averageSteps, trend, variability) {
    const insights = [];

    insights.push(`Média de ${averageSteps.toLocaleString()} passos/dia`);

    if (trend === 'increasing') {
      insights.push('Tendência positiva ↗️');
    } else if (trend === 'decreasing') {
      insights.push('Tendência negativa ↘️');
    } else {
      insights.push('Atividade estável →');
    }

    if (variability > 0.5) {
      insights.push('Alta variação na atividade diária');
    } else if (variability < 0.2) {
      insights.push('Rotina muito consistente');
    }

    return insights;
  }

  generateBurnoutRecommendations(riskLevel, factors) {
    const recommendations = [];

    if (riskLevel === 'high') {
      recommendations.push('🆘 Procure orientação médica');
      recommendations.push('🧘‍♂️ Pratique técnicas de relaxamento');
      recommendations.push('⚖️ Equilibre trabalho e descanso');
    } else if (riskLevel === 'medium') {
      recommendations.push('⚠️ Atenção aos sinais de estresse');
      recommendations.push('🌿 Reserve tempo para atividades prazerosas');
      recommendations.push('😴 Priorize qualidade do sono');
    } else {
      recommendations.push('✅ Continue com hábitos saudáveis');
      recommendations.push('📊 Monitore regularmente');
    }

    return recommendations;
  }

  getMockAnalysis() {
    return {
      riskLevel: 'medium',
      riskScore: 45,
      averageSteps: 6500,
      trend: 'stable',
      trendStrength: 25,
      consistency: 75,
      recommendations: [
        'Tente alcançar 10,000 passos diários',
        'Mantenha uma rotina consistente'
      ],
      insights: [
        'Média de 6,500 passos/dia',
        'Atividade estável'
      ]
    };
  }
}

export default new PredictiveAnalysis();
