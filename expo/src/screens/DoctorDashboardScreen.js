import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    total: 42,
    alerts: 5,
    highRisk: 3,
    monitoring: 9,
    inactive: 4,
    avgScore: 78, // %
  });

  const [refreshing, setRefreshing] = useState(false);

  // leve variação periódica dos números simulando atualização
  useEffect(() => {
    const id = setInterval(() => {
      setStats((prev) => {
        const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
        const rand = (min, max) => Math.random() * (max - min) + min;
        return {
          ...prev,
          avgScore: Math.round(clamp(prev.avgScore + rand(-2, 2), 60, 90)),
          alerts: Math.round(clamp(prev.alerts + rand(-1, 1), 2, 8)),
          highRisk: Math.round(clamp(prev.highRisk + rand(-1, 1), 1, 5)),
        };
      });
    }, 5000);

    return () => clearInterval(id);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // pacientes críticos / atenção imediata
  const criticalPatients = [
    {
      id: 1,
      name: 'Pedro Oliveira',
      age: 38,
      score: 45,
      risk: 'Alto',
      alerts: 3,
      steps: 3200,
      sleep: 4.5,
      heart: 82,
      nextAppointment: '2024-01-25',
    },
    {
      id: 2,
      name: 'Marina Lopes',
      age: 29,
      score: 62,
      risk: 'Médio',
      alerts: 2,
      steps: 5400,
      sleep: 6.1,
      heart: 76,
      nextAppointment: '2024-01-28',
    },
    {
      id: 3,
      name: 'Rafael Mendes',
      age: 41,
      score: 54,
      risk: 'Alto',
      alerts: 4,
      steps: 2100,
      sleep: 5.0,
      heart: 88,
      nextAppointment: '2024-01-29',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#0d6c8b"
        />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flexShrink: 1, paddingRight: 8 }}>
          <Text style={styles.hello}>Olá, Dr. Silva 👋</Text>
          <Text style={styles.subHello}>Dashboard geral dos pacientes</Text>
        </View>
        <Ionicons name="medkit-outline" size={28} color="#0d6c8b" />
      </View>

      {/* Visão Geral */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Visão Geral</Text>

        <View style={styles.overviewGrid}>
          {[
            { label: 'Total Pacientes', value: stats.total, color: '#0d6c8b', icon: 'people-outline' },
            { label: 'Com Alertas', value: stats.alerts, color: '#d32f2f', icon: 'alert-circle-outline' },
            { label: 'Alto Risco', value: stats.highRisk, color: '#ff9800', icon: 'warning-outline' },
            { label: 'Em Acomp.', value: stats.monitoring, color: '#0d6c8b', icon: 'pulse-outline' },
            { label: 'Inativos', value: stats.inactive, color: '#888', icon: 'remove-circle-outline' },
            { label: 'Score Médio', value: `${Math.round(stats.avgScore)}%`, color: '#0d6c8b', icon: 'stats-chart-outline' },
          ].map((box, idx) => (
            <View key={idx} style={styles.statBox}>
              <Ionicons name={box.icon} size={20} color={box.color} />
              <Text style={[styles.statNumber, { color: box.color }]}>{box.value}</Text>
              <Text style={styles.statLabel}>{box.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Pacientes que requerem atenção */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Pacientes que requerem atenção</Text>

        {criticalPatients.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.patientCard}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('DoctorPatients', { patient: p });
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>
                {p.name}{' '}
                <Text style={styles.patientAge}>({p.age} anos)</Text>
              </Text>

              <Text style={styles.patientInfoRow}>
                <Text style={styles.patientInfoPiece}>
                  <Ionicons name="pulse-outline" size={14} color="#d32f2f" /> {p.heart} bpm  ·{' '}
                </Text>
                <Text style={styles.patientInfoPiece}>
                  <Ionicons name="walk-outline" size={14} color="#0d6c8b" /> {p.steps} passos  ·{' '}
                </Text>
                <Text style={styles.patientInfoPiece}>
                  <Ionicons name="moon-outline" size={14} color="#0d6c8b" /> {p.sleep.toFixed(1)}h sono
                </Text>
              </Text>

              <Text style={styles.patientRiskLine}>
                Risco {p.risk} • {p.alerts} alerta(s) • Score {p.score}%
              </Text>
            </View>

            <Ionicons name="chevron-forward-outline" size={20} color="#0d6c8b" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Ações rápidas */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorPatients')}
          >
            <Ionicons name="people-outline" size={22} color="#0d6c8b" />
            <Text style={styles.quickText}>Todos os Pacientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorMetrics')}
          >
            <Ionicons name="document-text-outline" size={22} color="#0d6c8b" />
            <Text style={styles.quickText}>Relatório Semanal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorMetrics')}
          >
            <Ionicons name="calendar-outline" size={22} color="#0d6c8b" />
            <Text style={styles.quickText}>Minha Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorMetrics')}
          >
            <Ionicons name="stats-chart-outline" size={22} color="#0d6c8b" />
            <Text style={styles.quickText}>Métricas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef5f6', paddingHorizontal: 16, paddingTop: 40 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hello: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0d6c8b',
  },
  subHello: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d6c8b',
    marginBottom: 12,
  },

  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statBox: {
    width: '48%',
    backgroundColor: '#f6f8f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d6c8b',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },

  patientCard: {
    backgroundColor: '#f6f8f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0d6c8b',
  },
  patientAge: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
  patientInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  patientInfoPiece: {
    fontSize: 13,
    color: '#333',
  },
  patientRiskLine: {
    fontSize: 13,
    color: '#d32f2f',
    marginTop: 4,
    fontWeight: '500',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickBtn: {
    width: '48%',
    backgroundColor: '#eef5f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cfe4e9',
  },
  quickText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#0d6c8b',
    fontWeight: '600',
    marginTop: 6,
  },
});
