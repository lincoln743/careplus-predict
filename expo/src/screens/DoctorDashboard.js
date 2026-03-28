import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { useAuth } from '../context/AuthContext';
import { getDoctorPatients } from '../services/doctor';

const DoctorDashboard = ({ navigation }) => {
  const { token } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('backend');
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRisk: 0,
    pendingAlerts: 0,
    avgHealthScore: 0,
    needsFollowup: 0,
    withAlerts: 0,
    inactive: 0,
  });

  const mockPatients = [
    {
      id: '1',
      name: 'João Silva',
      age: 35,
      lastUpdate: '2024-01-20T10:30:00Z',
      healthScore: 78,
      riskLevel: 'medium',
      alerts: ['queda_ativ_fisica', 'sono_irregular'],
      steps: 6500,
      sleep: 5.8,
      heartRate: 75,
      status: 'active',
      nextAppointment: '2024-02-15',
    },
    {
      id: '2',
      name: 'Maria Santos',
      age: 32,
      lastUpdate: '2024-01-20T09:15:00Z',
      healthScore: 92,
      riskLevel: 'low',
      alerts: [],
      steps: 11500,
      sleep: 7.2,
      heartRate: 68,
      status: 'active',
      nextAppointment: null,
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      age: 38,
      lastUpdate: '2024-01-19T22:45:00Z',
      healthScore: 45,
      riskLevel: 'high',
      alerts: ['risco_burnout', 'sono_insuficiente', 'ativ_baixa'],
      steps: 3200,
      sleep: 4.5,
      heartRate: 82,
      status: 'high_risk',
      nextAppointment: '2024-01-25',
    },
    {
      id: '4',
      name: 'Ana Costa',
      age: 29,
      lastUpdate: '2024-01-20T08:00:00Z',
      healthScore: 85,
      riskLevel: 'low',
      alerts: ['inconsistencia'],
      steps: 8900,
      sleep: 6.8,
      heartRate: 72,
      status: 'active',
      nextAppointment: null,
    },
    {
      id: '5',
      name: 'Carlos Lima',
      age: 45,
      lastUpdate: '2024-01-05T14:20:00Z',
      healthScore: 65,
      riskLevel: 'medium',
      alerts: [],
      steps: 7200,
      sleep: 6.2,
      heartRate: 78,
      status: 'inactive',
      nextAppointment: '2024-02-05',
    },
    {
      id: '6',
      name: 'Fernanda Rocha',
      age: 41,
      lastUpdate: '2024-01-18T11:30:00Z',
      healthScore: 58,
      riskLevel: 'high',
      alerts: ['queda_ativ_fisica', 'sono_insuficiente'],
      steps: 4800,
      sleep: 5.2,
      heartRate: 85,
      status: 'high_risk',
      nextAppointment: '2024-01-28',
    },
  ];

  const normalizeRiskLevel = (status, score) => {
    const s = String(status || '').toLowerCase();

    if (s.includes('alto')) return 'high';
    if (s.includes('alerta')) return 'medium';
    if (s.includes('inativo')) return 'medium';
    if (s.includes('acompanhamento')) return 'low';

    const numericScore = Number(score || 0);
    if (numericScore < 60) return 'high';
    if (numericScore < 80) return 'medium';
    return 'low';
  };

  const normalizeStatus = (status, riskLevel) => {
    const s = String(status || '').toLowerCase();

    if (s.includes('inativo')) return 'inactive';
    if (riskLevel === 'high') return 'high_risk';
    return 'active';
  };

  const normalizePatients = (raw) => {
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.patients)
      ? raw.patients
      : [];

    return list.map((p, index) => {
      const healthScore = Number(p.healthScore ?? p.score ?? p.riskScore ?? 0);
      const riskLevel = normalizeRiskLevel(p.status, healthScore);

      return {
        id: String(p.id ?? index + 1),
        name: p.name ?? p.nome ?? `Paciente ${index + 1}`,
        age: Number(p.age ?? p.idade ?? 0),
        lastUpdate: p.lastUpdate ?? new Date().toISOString(),
        healthScore,
        riskLevel,
        alerts: Array.isArray(p.alerts) ? p.alerts : [],
        steps: Number(p.steps ?? p.passos ?? 0),
        sleep: Number(p.sleep ?? p.sono ?? 0),
        heartRate: Number(p.heartRate ?? p.fc ?? p.bpm ?? 0),
        status: normalizeStatus(p.status, riskLevel),
        nextAppointment: p.nextAppointment ?? null,
      };
    });
  };

  const calculateStats = (list) => {
    const totalPatients = list.length;
    const highRisk = list.filter((p) => p.riskLevel === 'high').length;
    const pendingAlerts = list.reduce((acc, patient) => acc + patient.alerts.length, 0);
    const avgHealthScore = totalPatients
      ? Math.round(list.reduce((acc, patient) => acc + patient.healthScore, 0) / totalPatients)
      : 0;
    const needsFollowup = list.filter((p) => p.nextAppointment).length;
    const withAlerts = list.filter((p) => p.alerts.length > 0).length;
    const inactive = list.filter((p) => p.status === 'inactive').length;

    setStats({
      totalPatients,
      highRisk,
      pendingAlerts,
      avgHealthScore,
      needsFollowup,
      withAlerts,
      inactive,
    });
  };

  const loadPatients = async () => {
    try {
      setLoading(true);

      const response = await getDoctorPatients(token);

      if (!response?.ok) {
        throw new Error('Falha na API');
      }

      const normalized = normalizePatients(response.data);

      if (!normalized.length) {
        throw new Error('Lista vazia');
      }

      setPatients(normalized);
      calculateStats(normalized);
      setDataSource('backend');
    } catch (error) {
      console.log('DOCTOR DASHBOARD FALLBACK:', error);
      setPatients(mockPatients);
      calculateStats(mockPatients);
      setDataSource('fallback demo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const StatCard = ({ title, value, subtitle, color = colors.primary }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );

  const PatientCard = ({ patient }) => (
    <TouchableOpacity
      style={[
        globalStyles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor:
            patient.riskLevel === 'high'
              ? colors.danger
              : patient.riskLevel === 'medium'
              ? colors.warning
              : colors.success,
        },
      ]}
      onPress={() => navigation.navigate('PatientDetail', { patient })}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientAge}>
            {patient.age} anos • Score: {patient.healthScore}
          </Text>
        </View>
        <View
          style={[
            styles.riskBadge,
            {
              backgroundColor:
                patient.riskLevel === 'high'
                  ? colors.danger + '20'
                  : patient.riskLevel === 'medium'
                  ? colors.warning + '20'
                  : colors.success + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.riskText,
              {
                color:
                  patient.riskLevel === 'high'
                    ? colors.danger
                    : patient.riskLevel === 'medium'
                    ? colors.warning
                    : colors.success,
              },
            ]}
          >
            Risco{' '}
            {patient.riskLevel === 'high'
              ? 'Alto'
              : patient.riskLevel === 'medium'
              ? 'Médio'
              : 'Baixo'}
          </Text>
        </View>
      </View>

      {patient.alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsLabel}>Alertas: </Text>
          {patient.alerts.map((alert, index) => (
            <Text key={index} style={styles.alertItem}>
              {getAlertLabel(alert)}
              {index < patient.alerts.length - 1 ? ', ' : ''}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.patientStats}>
        <Text style={styles.patientStat}>👟 {patient.steps.toLocaleString()} passos</Text>
        <Text style={styles.patientStat}>😴 {patient.sleep}h sono</Text>
        <Text style={styles.patientStat}>💓 {patient.heartRate} bpm</Text>
      </View>
    </TouchableOpacity>
  );

  const getAlertLabel = (alertType) => {
    const labels = {
      queda_ativ_fisica: 'Queda na atividade',
      sono_irregular: 'Sono irregular',
      risco_burnout: 'Risco de burnout',
      sono_insuficiente: 'Sono insuficiente',
      ativ_baixa: 'Atividade baixa',
      inconsistencia: 'Inconsistência',
    };
    return labels[alertType] || alertType;
  };

  useEffect(() => {
    loadPatients();
  }, [token]);

  if (loading && patients.length === 0) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.text }}>
          Carregando dados dos pacientes...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Médico</Text>
        <Text style={styles.headerSubtitle}>CarePlus Predict</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>
          Fonte: {dataSource}
        </Text>
      </View>

      <ScrollView
        style={globalStyles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[globalStyles.subtitle, { textAlign: 'left', marginBottom: 15 }]}>
          Visão Geral
        </Text>

        <View style={styles.statsGrid}>
          <StatCard title="Total" value={stats.totalPatients} color={colors.primary} />
          <StatCard
            title="Alto Risco"
            value={stats.highRisk}
            color={colors.danger}
            subtitle={stats.totalPatients ? `${Math.round((stats.highRisk / stats.totalPatients) * 100)}%` : '0%'}
          />
          <StatCard title="Com Alertas" value={stats.withAlerts} color={colors.warning} />
          <StatCard title="Acompanhamento" value={stats.needsFollowup} color={colors.secondary} />
          <StatCard title="Inativos" value={stats.inactive} color="#666" />
          <StatCard title="Score Médio" value={stats.avgHealthScore} color={colors.success} />
        </View>

        <View style={{ marginTop: 25 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <Text style={[globalStyles.subtitle, { textAlign: 'left', marginBottom: 0 }]}>
              Pacientes que Requerem Atenção
            </Text>
            <Text style={{ color: '#666', fontSize: 14 }}>
              {patients.filter((p) => p.riskLevel === 'high' || p.alerts.length > 0).length} pacientes
            </Text>
          </View>

          {patients
            .filter((patient) => patient.riskLevel === 'high' || patient.alerts.length > 0)
            .sort((a, b) => {
              const riskOrder = { high: 3, medium: 2, low: 1 };
              return riskOrder[b.riskLevel] - riskOrder[a.riskLevel] || b.alerts.length - a.alerts.length;
            })
            .map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}

          {patients.filter((patient) => patient.riskLevel === 'high' || patient.alerts.length > 0).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>🎉 Todos os pacientes estão bem!</Text>
              <Text style={styles.emptySubtext}>Nenhum alerta ou risco alto detectado.</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 30, marginBottom: 20 }}>
          <Text style={[globalStyles.subtitle, { textAlign: 'left', marginBottom: 15 }]}>
            Ações Rápidas
          </Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorPatients')}>
              <Text style={styles.actionButtonText}>👥 Todos os Pacientes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Relatório', 'Gerando relatório...')}>
              <Text style={styles.actionButtonText}>📋 Relatório Semanal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Agenda', 'Abrindo agenda...')}>
              <Text style={styles.actionButtonText}>📅 Minha Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorMetrics')}>
              <Text style={styles.actionButtonText}>📊 Métricas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  statCard: {
    width: '31%',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    margin: 5,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  alertsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  alertItem: {
    fontSize: 12,
    color: colors.warning,
  },
  patientStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  patientStat: {
    fontSize: 12,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    margin: 5,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
};

export default DoctorDashboard;
