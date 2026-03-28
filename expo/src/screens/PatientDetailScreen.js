import React, { useRef, useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getLatestPatientHealth } from '../services/patient';

export default function PatientDetailScreen({ navigation, route }) {
  const { token } = useAuth();
  const { patient } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const [loadingBack, setLoadingBack] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dataSource, setDataSource] = useState('navegação');
  const [detail, setDetail] = useState(patient || null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  useEffect(() => {
    const loadRealData = async () => {
      if (!patient?.id) return;

      try {
        setLoadingData(true);

        const response = await getLatestPatientHealth(patient.id, token);

        if (!response?.ok || !response?.data?.ok || !response?.data?.data) {
          throw new Error('Sem dados recentes');
        }

        const latest = response.data.data;

        setDetail((prev) => ({
          ...prev,
          steps: latest.steps ?? prev?.steps ?? 0,
          sleep: latest.sleep ?? prev?.sleep ?? 0,
          distance: latest.distance ?? prev?.distance ?? 0,
        }));

        setDataSource('backend');
      } catch (error) {
        console.log('PATIENT DETAIL FALLBACK:', error);
        setDataSource('navegação');
      } finally {
        setLoadingData(false);
      }
    };

    loadRealData();
  }, [patient?.id, token]);

  const handleBack = () => {
    setLoadingBack(true);
    setTimeout(() => {
      setLoadingBack(false);
      navigation.navigate('DoctorDashboard');
    }, 1000);
  };

  return (
    <Animated.ScrollView
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sourceText}>Fonte: {dataSource}</Text>

      <Text style={styles.loadingText}>
        {loadingData ? 'Atualizando dados do paciente...' : ''}
      </Text>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      <Animated.View>
        <Text />
      </Animated.View>

      {/* header */}
      <Animated.View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#0d6c8b" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Paciente</Text>
      </Animated.View>

      {/* bloco informações básicas */}
      <Animated.View style={styles.card}>
        <Text style={styles.cardTitle}>Informações Básicas</Text>
        {detail ? (
          <>
            <Text style={styles.info}>
              <Text style={styles.label}>Nome: </Text>
              {detail.name}
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Idade: </Text>
              {detail.age} anos
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Score de Saúde: </Text>
              {detail.healthScore ?? detail.score ?? 0}%
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Risco: </Text>
              {detail.riskLevel ?? detail.status ?? 'N/A'}
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Próxima Consulta: </Text>
              {detail.nextAppointment || 'Não agendada'}
            </Text>
          </>
        ) : (
          <Text style={styles.info}>Nenhum paciente selecionado.</Text>
        )}
      </Animated.View>

      {/* alertas */}
      {detail?.alerts && (
        <Animated.View style={styles.card}>
          <Text style={styles.cardTitle}>Alertas Recentes</Text>
          {detail.alerts.length > 0 ? (
            detail.alerts.map((alert, idx) => (
              <Animated.View key={idx} style={styles.alertRow}>
                <Ionicons name="alert-circle-outline" size={18} color="#d32f2f" />
                <Text style={styles.alertText}>{String(alert).replace(/_/g, ' ')}</Text>
              </Animated.View>
            ))
          ) : (
            <Text style={styles.info}>Nenhum alerta recente.</Text>
          )}
        </Animated.View>
      )}

      {/* indicadores atuais */}
      {detail && (
        <Animated.View style={styles.card}>
          <Text style={styles.cardTitle}>Indicadores Atuais</Text>

          <Animated.View style={styles.metricRow}>
            <Ionicons name="pulse-outline" size={20} color="#d32f2f" />
            <Text style={styles.metricText}>
              Frequência Cardíaca: {detail.heartRate ?? 0} bpm
            </Text>
          </Animated.View>

          <Animated.View style={styles.metricRow}>
            <Ionicons name="walk-outline" size={20} color="#0d6c8b" />
            <Text style={styles.metricText}>Passos: {detail.steps ?? 0}</Text>
          </Animated.View>

          <Animated.View style={styles.metricRow}>
            <Ionicons name="moon-outline" size={20} color="#0d6c8b" />
            <Text style={styles.metricText}>Sono: {detail.sleep ?? 0}h</Text>
          </Animated.View>

          <Animated.View style={styles.metricRow}>
            <Ionicons name="navigate-outline" size={20} color="#0d6c8b" />
            <Text style={styles.metricText}>Distância: {detail.distance ?? 0}</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* voltar ao dashboard */}
      <TouchableOpacity
        style={[styles.backDashboardBtn, loadingBack && { opacity: 0.8 }]}
        activeOpacity={0.85}
        disabled={loadingBack}
        onPress={handleBack}
      >
        {loadingBack ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="home-outline" size={20} color="#fff" />
            <Text style={styles.backDashboardText}>Voltar ao Dashboard</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5f6',
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  sourceText: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#0d6c8b',
    marginBottom: 8,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: {
    marginRight: 10,
    backgroundColor: '#e5f2f5',
    borderRadius: 10,
    padding: 6,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#0d6c8b' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0d6c8b', marginBottom: 10 },

  info: { fontSize: 14, color: '#333', marginBottom: 6 },
  label: { fontWeight: '600', color: '#0d6c8b' },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricText: { fontSize: 14, color: '#444', marginLeft: 8 },

  backDashboardBtn: {
    backgroundColor: '#0d6c8b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  backDashboardText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '600',
  },
});
