class AlertService {
  constructor() {
    this.alerts = [];
  }

  generateAlerts(patientData, predictiveAnalysis) {
    const alerts = [];
    const timestamp = new Date().toISOString();

    // Alerta de baixa atividade
    if (predictiveAnalysis.steps.riskLevel === 'high') {
      alerts.push({
        id: `alert-${timestamp}-1`,
        type: 'low_activity',
        title: '🚶‍♂️ Baixa Atividade Física',
        message: `Sua média de ${predictiveAnalysis.steps.averageSteps} passos está abaixo do ideal.`,
        severity: 'high',
        timestamp,
        data: {
          current: predictiveAnalysis.steps.averageSteps,
          recommended: 10000,
          trend: predictiveAnalysis.steps.trend
        },
        actions: ['suggest_exercise', 'schedule_consultation']
      });
    }

    // Alerta de sono inadequado
    if (predictiveAnalysis.sleep.riskLevel === 'high') {
      alerts.push({
        id: `alert-${timestamp}-2`,
        type: 'poor_sleep',
        title: '😴 Sono Insuficiente',
        message: `Média de ${predictiveAnalysis.sleep.averageSleep}h de sono por noite.`,
        severity: 'high',
        timestamp,
        data: {
          current: predictiveAnalysis.sleep.averageSleep,
          recommended: 7,
          consistency: predictiveAnalysis.sleep.consistency
        },
        actions: ['sleep_hygiene_tips', 'relaxation_exercises']
      });
    }

    // Alerta de risco de burnout
    if (predictiveAnalysis.burnout.riskLevel === 'high') {
      alerts.push({
        id: `alert-${timestamp}-3`,
        type: 'burnout_risk',
        title: '🔥 Risco de Burnout',
        message: `Alto risco detectado baseado em ${predictiveAnalysis.burnout.factors.length} fatores.`,
        severity: 'critical',
        timestamp,
        data: {
          factors: predictiveAnalysis.burnout.factors,
          score: predictiveAnalysis.burnout.riskScore,
          urgency: predictiveAnalysis.burnout.urgency
        },
        actions: ['immediate_consultation', 'stress_management']
      });
    }

    // Alerta de tendência negativa
    if (predictiveAnalysis.steps.trend === 'decreasing' && predictiveAnalysis.steps.trendStrength > 100) {
      alerts.push({
        id: `alert-${timestamp}-4`,
        type: 'negative_trend',
        title: '📉 Queda na Atividade',
        message: 'Sua atividade física está em declínio consistente.',
        severity: 'medium',
        timestamp,
        data: {
          trend: predictiveAnalysis.steps.trend,
          strength: predictiveAnalysis.steps.trendStrength
        },
        actions: ['review_routine', 'set_new_goals']
      });
    }

    // Alerta de inconsistência
    if (predictiveAnalysis.steps.consistency < 60) {
      alerts.push({
        id: `alert-${timestamp}-5`,
        type: 'inconsistency',
        title: '🔄 Rotina Irregular',
        message: `Sua consistência de atividade é ${predictiveAnalysis.steps.consistency}%.`,
        severity: 'medium',
        timestamp,
        data: {
          consistency: predictiveAnalysis.steps.consistency,
          recommended: 80
        },
        actions: ['create_schedule', 'set_reminders']
      });
    }

    this.alerts = [...this.alerts, ...alerts];
    return alerts;
  }

  getAlerts() {
    return this.alerts;
  }

  markAsRead(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      alert.readAt = new Date().toISOString();
    }
  }

  getUnreadAlerts() {
    return this.alerts.filter(alert => !alert.read);
  }

  clearOldAlerts() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > oneWeekAgo
    );
  }
}

export default new AlertService();
