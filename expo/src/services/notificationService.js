// Serviço de Notificações - DESABILITADO para Expo Go
// Para usar notificações push, é necessário criar um Development Build

class NotificationService {
  constructor() {
    this.token = null;
    this.isConfigured = false;
  }

  // Configurar notificações - DESABILITADO
  async configure() {
    console.log('Notificações desabilitadas no Expo Go');
    return false;
  }

  // Obter token push - DESABILITADO
  getToken() {
    return null;
  }

  // Agendar notificação local - DESABILITADO
  async scheduleLocalNotification(title, body, data = {}) {
    console.log('Notificações locais desabilitadas');
    return false;
  }

  // Agendar notificação com trigger temporal - DESABILITADO
  async scheduleNotification(title, body, trigger, data = {}) {
    console.log('Notificações agendadas desabilitadas');
    return false;
  }

  // Enviar notificação push - DESABILITADO
  async sendPushNotification(expoPushToken, title, body, data = {}) {
    console.log('Notificações push desabilitadas');
    return false;
  }

  // Cancelar todas as notificações - DESABILITADO
  async cancelAllNotifications() {
    console.log('Cancelamento de notificações desabilitado');
  }

  // Criar notificação de alerta de saúde - DESABILITADO
  async sendHealthAlert(alertType, patientData = {}) {
    console.log('Alertas de saúde desabilitados');
    return false;
  }

  // Notificação para o médico - DESABILITADO
  async sendDoctorAlert(patientName, alertType, severity) {
    console.log('Notificações médicas desabilitadas');
    return false;
  }
}

export default new NotificationService();
