import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PatientDetailScreen({ navigation, route }) {
  const { patient } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [loadingBack, setLoadingBack] = useState(false);

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
  }, []);

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
      {/* header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#0d6c8b" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Paciente</Text>
      </View>

      {/* bloco informações básicas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações Básicas</Text>
        {patient ? (
          <>
            <Text style={styles.info}>
              <Text style={styles.label}>Nome: </Text>
              {patient.name}
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Idade: </Text>
              {patient.age} anos
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Score de Saúde: </Text>
              {patient.healthScore}%
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Risco: </Text>
              {patient.riskLevel}
            </Text>

            <Text style={styles.info}>
              <Text style={styles.label}>Próxima Consulta: </Text>
              {patient.nextAppointment}
            </Text>
          </>
        ) : (
          <Text style={styles.info}>Nenhum paciente selecionado.</Text>
        )}
      </View>

      {/* alertas */}
      {patient?.alerts && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertas Recentes</Text>
          {patient.alerts.map((alert, idx) => (
            <View key={idx} style={styles.alertRow}>
              <Ionicons name="alert-circle-outline" size={18} color="#d32f2f" />
              <Text style={styles.alertText}>{alert.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
      )}

      {/* indicadores atuais */}
      {patient && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Indicadores Atuais</Text>

          <View style={styles.metricRow}>
            <Ionicons name="pulse-outline" size={20} color="#d32f2f" />
            <Text style={styles.metricText}>
              Frequência Cardíaca: {patient.heartRate} bpm
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Ionicons name="walk-outline" size={20} color="#0d6c8b" />
            <Text style={styles.metricText}>Passos: {patient.steps}</Text>
          </View>

          <View style={styles.metricRow}>
            <Ionicons name="moon-outline" size={20} color="#0d6c8b" />
            <Text style={styles.metricText}>Sono: {patient.sleep}h</Text>
          </View>
        </View>
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
  container: { flex: 1, backgroundColor: '#eef5f6', paddingHorizontal: 16, paddingTop: 40 },

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
