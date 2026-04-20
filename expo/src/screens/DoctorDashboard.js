import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/global';
import { useAuth } from '../context/AuthContext';
import { getDoctorPatients } from '../services/doctor';

const DoctorDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const token = user?.token;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('carregando...');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalPatients: 0, highRisk: 0, pendingAlerts: 0, avgHealthScore: 0, needsFollowup: 0, withAlerts: 0, inactive: 0 });

  const normalizeRiskLevel = (status, score) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('alto') || s.includes('high')) return 'high';
    if (s.includes('alerta') || s.includes('inativo') || s.includes('medium')) return 'medium';
    if (s.includes('acompanhamento') || s.includes('low')) return 'low';
    const n = Number(score || 0);
    if (n < 60) return 'high';
    if (n < 80) return 'medium';
    return 'low';
  };

  const normalizeStatus = (status, riskLevel) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('offline') || s.includes('inativo')) return 'inactive';
    if (s.includes('active_today') || s.includes('online')) return 'active';
    if (riskLevel === 'high') return 'high_risk';
    return 'active';
  };

  const normalizePatients = (raw) => {
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.patients) ? raw.patients : [];
    return list.map((p, index) => {
      const healthScore = Number(p.healthScore ?? p.score ?? p.riskScore ?? 0);
      const riskLevel = normalizeRiskLevel(p.status ?? p.statusLabel, healthScore);
      return {
        id: String(p.id ?? index + 1),
        name: p.name ?? p.nome ?? `Paciente ${index + 1}`,
        age: Number(p.age ?? p.idade ?? 0),
        lastUpdate: p.lastUpdate ?? p.lastSeen ?? p.latestTs ?? new Date().toISOString(),
        healthScore,
        riskLevel,
        alerts: Array.isArray(p.alerts) ? p.alerts : [],
        steps: Number(p.steps ?? p.passos ?? 0),
        sleep: Number(p.sleep ?? p.sono ?? 0),
        heartRate: Number(p.heartRate ?? p.fc ?? p.bpm ?? 0),
        status: normalizeStatus(p.status ?? p.statusLabel, riskLevel),
        nextAppointment: p.nextAppointment ?? null,
      };
    });
  };

  const calculateStats = (list) => {
    const totalPatients = list.length;
    const highRisk = list.filter((p) => p.riskLevel === 'high').length;
    const pendingAlerts = list.reduce((acc, p) => acc + p.alerts.length, 0);
    const avgHealthScore = totalPatients ? Math.round(list.reduce((acc, p) => acc + p.healthScore, 0) / totalPatients) : 0;
    setStats({ totalPatients, highRisk, pendingAlerts, avgHealthScore, needsFollowup: list.filter((p) => p.nextAppointment).length, withAlerts: list.filter((p) => p.alerts.length > 0).length, inactive: list.filter((p) => p.status === 'inactive').length });
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getDoctorPatients(token);
      const normalized = normalizePatients(list);
      if (!normalized.length) throw new Error('Lista vazia retornada pelo backend');
      setPatients(normalized);
      calculateStats(normalized);
      setDataSource('backend');
    } catch (err) {
      console.error('[DoctorDashboard] Erro:', err.message);
      setError('Nao foi possivel carregar pacientes. Verifique a conexao.');
      setDataSource('erro');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadPatients(); }, [token]);

  const getAlertLabel = (alertType) => {
    const labels = { queda_ativ_fisica: 'Queda na atividade', sono_irregular: 'Sono irregular', risco_burnout: 'Risco de burnout', sono_insuficiente: 'Sono insuficiente', ativ_baixa: 'Atividade baixa', inconsistencia: 'Inconsistencia' };
    return labels[alertType] || alertType;
  };

  const StatCard = ({ title, value, subtitle, color = colors.primary }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );

  const PatientCard = ({ patient }) => (
    <TouchableOpacity style={[globalStyles.card, { borderLeftWidth: 4, borderLeftColor: patient.riskLevel === 'high' ? colors.danger : patient.riskLevel === 'medium' ? colors.warning : colors.success }]} onPress={() => navigation.navigate('PatientDetail', { patient })}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientAge}>{patient.age} anos - Score: {patient.healthScore}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: patient.riskLevel === 'high' ? colors.danger + '20' : patient.riskLevel === 'medium' ? colors.warning + '20' : colors.success + '20' }]}>
          <Text style={[styles.riskText, { color: patient.riskLevel === 'high' ? colors.danger : patient.riskLevel === 'medium' ? colors.warning : colors.success }]}>
            Risco {patient.riskLevel === 'high' ? 'Alto' : patient.riskLevel === 'medium' ? 'Medio' : 'Baixo'}
          </Text>
        </View>
      </View>
      {patient.alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsLabel}>Alertas: </Text>
          {patient.alerts.map((alert, index) => <Text key={index} style={styles.alertItem}>{getAlertLabel(alert)}{index < patient.alerts.length - 1 ? ', ' : ''}</Text>)}
        </View>
      )}
      <View style={styles.patientStats}>
        <Text style={styles.patientStat}>👟 {patient.steps.toLocaleString()} passos</Text>
        <Text style={styles.patientStat}>😴 {patient.sleep}h sono</Text>
        <Text style={styles.patientStat}>💓 {patient.heartRate} bpm</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && patients.length === 0) return (
    <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 20, color: colors.text }}>Carregando pacientes...</Text>
    </View>
  );

  if (error) return (
    <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
      <Ionicons name="cloud-offline-outline" size={48} color="#d9372e" />
      <Text style={{ color: '#d9372e', fontSize: 15, textAlign: 'center', marginTop: 12 }}>{error}</Text>
      <TouchableOpacity onPress={loadPatients} style={{ marginTop: 20, backgroundColor: colors.primary, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Medico</Text>
        <Text style={styles.headerSubtitle}>CarePlus Predict</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>Fonte: {dataSource}</Text>
      </View>
      <ScrollView style={globalStyles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPatients(); }} />}>
        <Text style={[globalStyles.subtitle, { textAlign: 'left', marginBottom: 15 }]}>Visao Geral</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Total" value={stats.totalPatients} color={colors.primary} />
          <StatCard title="Alto Risco" value={stats.highRisk} color={colors.danger} subtitle={stats.totalPatients ? `${Math.round((stats.highRisk / stats.totalPatients) * 100)}%` : '0%'} />
          <StatCard title="Com Alertas" value={stats.withAlerts} color={colors.warning} />
          <StatCard title="Acompanhamento" value={stats.needsFollowup} color={colors.secondary} />
          <StatCard title="Inativos" value={stats.inactive} color="#666" />
          <StatCard title="Score Medio" value={stats.avgHealthScore} color={colors.success} />
        </View>
        <View style={{ marginTop: 25 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[globalStyles.subtitle, { textAlign: 'left', marginBottom: 0 }]}>Pacientes que Requerem Atencao</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>{patients.filter((p) => p.riskLevel === 'high' || p.alerts.length > 0).length} pacientes</Text>
          </View>
          {patients.filter((p) => p.riskLevel === 'high' || p.alerts.length > 0).sort((a, b) => { const o = { high: 3, medium: 2, low: 1 }; return o[b.riskLevel] - o[a.riskLevel] || b.alerts.length - a.alerts.length; }).map((p) => <PatientCard key={p.id} patient={p} />)}
          {patients.filter((p) => p.riskLevel === 'high' || p.alerts.length > 0).length === 0 && (
            <View style={styles.emptyState}><Text style={styles.emptyText}>Todos os pacientes estao bem!</Text><Text style={styles.emptySubtext}>Nenhum alerta ou risco alto detectado.</Text></View>
          )}
        </View>
        <View style={{ marginTop: 30, marginBottom: 20 }}>
          <Text style={[globalStyles.subtitle, { textAlign: 'left', marginBottom: 15 }]}>Acoes Rapidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorPatients')}><Text style={styles.actionButtonText}>👥 Todos os Pacientes</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Relatorio', 'Gerando relatorio...')}><Text style={styles.actionButtonText}>📋 Relatorio Semanal</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Agenda', 'Abrindo agenda...')}><Text style={styles.actionButtonText}>📅 Minha Agenda</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorMetrics')}><Text style={styles.actionButtonText}>📊 Metricas</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  header: { backgroundColor: '#0d6c8b', padding: 20, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: -5 },
  statCard: { width: '31%', backgroundColor: '#fff', padding: 15, borderRadius: 10, margin: 5, borderLeftWidth: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0d6c8b', marginBottom: 5, textAlign: 'center' },
  statTitle: { fontSize: 12, color: '#666', fontWeight: '500', textAlign: 'center' },
  statSubtitle: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 2 },
  patientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  patientAge: { fontSize: 14, color: '#666' },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  riskText: { fontSize: 11, fontWeight: '600' },
  alertsContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 10, padding: 10, backgroundColor: '#fff3cd', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#f2c037' },
  alertsLabel: { fontSize: 12, fontWeight: '600', color: '#f2c037' },
  alertItem: { fontSize: 12, color: '#f2c037' },
  patientStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  patientStat: { fontSize: 12, color: '#666' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { backgroundColor: '#fff', padding: 15, borderRadius: 10, margin: 5, flex: 1, minWidth: '45%', alignItems: 'center', elevation: 2 },
  actionButtonText: { color: '#0d6c8b', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 10 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#3cb371', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
};

export default DoctorDashboard;
