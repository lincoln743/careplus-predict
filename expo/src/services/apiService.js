// Serviço para simular integração com backend
// Em produção, substituir por chamadas HTTP reais

class ApiService {
  constructor() {
    this.baseURL = 'https://api.carepluspredict.com'; // URL exemplo
    this.patients = this.loadFromStorage('patients') || [];
    this.alerts = this.loadFromStorage('alerts') || [];
    this.interventions = this.loadFromStorage('interventions') || [];
  }

  // Simular chamadas HTTP
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (endpoint) {
        case '/patients':
          if (method === 'GET') return this.getPatients();
          if (method === 'POST') return this.createPatient(data);
          
        case '/alerts':
          if (method === 'GET') return this.getAlerts();
          if (method === 'POST') return this.createAlert(data);
          
        case '/interventions':
          if (method === 'GET') return this.getInterventions();
          if (method === 'POST') return this.createIntervention(data);
          
        case '/health-data':
          if (method === 'POST') return this.saveHealthData(data);
          
        default:
          throw new Error(`Endpoint ${endpoint} não encontrado`);
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Gerenciamento de Pacientes
  async getPatients() {
    return {
      success: true,
      data: this.patients,
      timestamp: new Date().toISOString()
    };
  }

  async createPatient(patientData) {
    const newPatient = {
      id: this.generateId(),
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.patients.push(newPatient);
    this.saveToStorage('patients', this.patients);
    
    return {
      success: true,
      data: newPatient
    };
  }

  // Gerenciamento de Alertas
  async getAlerts(filters = {}) {
    let filteredAlerts = this.alerts;
    
    if (filters.patientId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.patientId === filters.patientId);
    }
    
    if (filters.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === filters.resolved);
    }
    
    return {
      success: true,
      data: filteredAlerts,
      count: filteredAlerts.length
    };
  }

  async createAlert(alertData) {
    const newAlert = {
      id: this.generateId(),
      ...alertData,
      createdAt: new Date().toISOString(),
      resolved: false,
      resolvedAt: null
    };
    
    this.alerts.push(newAlert);
    this.saveToStorage('alerts', this.alerts);
    
    return {
      success: true,
      data: newAlert
    };
  }

  async resolveAlert(alertId, resolutionNotes = '') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolutionNotes = resolutionNotes;
      this.saveToStorage('alerts', this.alerts);
    }
    
    return {
      success: true,
      data: alert
    };
  }

  // Gerenciamento de Intervenções
  async getInterventions() {
    return {
      success: true,
      data: this.interventions
    };
  }

  async createIntervention(interventionData) {
    const newIntervention = {
      id: this.generateId(),
      ...interventionData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    this.interventions.push(newIntervention);
    this.saveToStorage('interventions', this.interventions);
    
    return {
      success: true,
      data: newIntervention
    };
  }

  // Dados de Saúde
  async saveHealthData(healthData) {
    const patient = this.patients.find(p => p.id === healthData.patientId);
    if (patient) {
      if (!patient.healthHistory) {
        patient.healthHistory = [];
      }
      
      patient.healthHistory.push({
        ...healthData,
        timestamp: new Date().toISOString()
      });
      
      patient.updatedAt = new Date().toISOString();
      this.saveToStorage('patients', this.patients);
    }
    
    return {
      success: true,
      data: healthData
    };
  }

  // Analytics e Relatórios
  async getPatientAnalytics(patientId, period = '7d') {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Gerar analytics simulados
    return {
      success: true,
      data: {
        patientId,
        period,
        steps: {
          average: Math.floor(Math.random() * 5000) + 3000,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          consistency: Math.floor(Math.random() * 40) + 60
        },
        sleep: {
          average: (Math.random() * 2) + 6,
          quality: Math.floor(Math.random() * 40) + 60
        },
        heartRate: {
          average: Math.floor(Math.random() * 20) + 65,
          variability: Math.floor(Math.random() * 15) + 10
        },
        riskScore: Math.floor(Math.random() * 40) + 40,
        recommendations: [
          'Aumentar atividade física para 10,000 passos diários',
          'Manter consistência no padrão de sono',
          'Monitorar frequência cardíaca em repouso'
        ]
      }
    };
  }

  // Utilitários
  generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveToStorage(key, data) {
    try {
      // Em ambiente real, isso seria substituído por AsyncStorage ou banco de dados
      console.log(`Saving ${key} to storage:`, data);
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  }

  loadFromStorage(key) {
    try {
      // Em ambiente real, isso carregaria de AsyncStorage ou banco de dados
      console.log(`Loading ${key} from storage`);
      return null; // Sempre retorna null para simular storage vazio
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }

  // Limpar dados (para desenvolvimento)
  clearData() {
    this.patients = [];
    this.alerts = [];
    this.interventions = [];
    console.log('All data cleared');
  }
}

export default new ApiService();
