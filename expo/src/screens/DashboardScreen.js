import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getLatestPatientHealth } from '../services/patient';
import { apiRequest } from '../services/apiClient';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DashboardScreen = () => {
  const { userId, token } = useAuth();
  const [score, setScore] = useState(null);
  const [fc, setFc] = useState(null);
  const [steps, setSteps] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dataSource, setDataSource] = useState('carregando...');
  const [error, setError] = useState(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = 110;
  const circumference = Math.PI * radius;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const classifyRisk = (v) => {
    if (v < 33) return 'Risco Alto';
    if (v < 67) return 'Atencao';
    return 'Estavel';
  };

  const calculateScore = ({ stepsValue, sleepValue, fcValue }) => {
    const stepScore = clamp((stepsValue / 8000) * 100, 0, 100);
    const sleepScore = clamp((sleepValue / 8) * 100, 0, 100);
    let heartScore = 70;
    if (fcValue >= 60 && fcValue <= 80) heartScore = 90;
    else if (fcValue > 80 && fcValue <= 90) heartScore = 70;
    else if (fcValue > 90) heartScore = 50;
    else if (fcValue < 60) heartScore = 65;
    return Math.round((stepScore * 0.4) + (sleepScore * 0.35) + (heartScore * 0.25));
  };

  const animateScore = (v) => {
    Animated.timing(animatedValue, { toValue: v, duration: 1000, useNativeDriver: false }).start();
  };

  const applyData = ({ stepsValue, sleepValue, fcValue }) => {
    const newScore = calculateScore({ stepsValue, sleepValue, fcValue });
    setSteps(stepsValue); setSleep(sleepValue); setFc(fcValue);
    setScore(newScore); setProgress(clamp(newScore, 0, 100));
    animateScore(newScore);
  };

  const loadRealData = async () => {
    try {
      setError(null);
      const latestResponse = await getLatestPatientHealth(userId, token);
      if (!latestResponse?.ok || !latestResponse?.data?.ok) throw new Error('health/latest falhou');
      const latest = latestResponse.data.data || {};
      let stepsValue = Number(latest.steps ?? 0);
      let sleepValue = Number(latest.sleep ?? 0);
      let fcValue = 78;
      const dailyResponse = await apiRequest(`/health/history/daily?userId=${encodeURIComponent(userId)}`, { method: 'GET', token });
      if (dailyResponse?.ok && dailyResponse?.data?.ok && Array.isArray(dailyResponse.data.days) && dailyResponse.data.days.length > 0) {
        const d = dailyResponse.data.days[dailyResponse.data.days.length - 1];
        sleepValue = Number(d.avgSleep ?? d.sleep ?? sleepValue);
        stepsValue = Number(d.totalSteps ?? d.steps ?? stepsValue);
        fcValue = Number(d.avgHeartRate ?? d.heartRate ?? fcValue);
      }
      applyData({ stepsValue: clamp(stepsValue, 0, 50000), sleepValue: clamp(sleepValue, 0, 24), fcValue: clamp(fcValue, 30, 200) });
      setDataSource('backend');
    } catch (err) {
      console.error('[Dashboard] Erro:', err.message);
      setError('Sem dados. Verifique a conexao com o servidor.');
      setDataSource('erro');
    }
  };

  useEffect(() => {
    loadRealData();
    const t = setInterval(loadRealData, 10000);
    return () => clearInterval(t);
  }, [userId, token]);

  const strokeDashoffset = animatedValue.interpolate({ inputRange: [0, 100], outputRange: [circumference, 0] });

  if (error) return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="cloud-offline-outline" size={48} color="#d9372e" />
        <Text style={{ color: '#d9372e', fontSize: 16, textAlign: 'center', marginTop: 12 }}>{error}</Text>
      </View>
    </SafeAreaView>
  );

  if (score === null) return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#0d6c8b' }}>Carregando dados...</Text>
      </View>
    </SafeAreaView>
  );

  const classification = classifyRisk(score);
  const activityRisk = steps < 5000 ? 'Alto' : steps < 7000 ? 'Medio' : 'Baixo';
  const sleepRisk = sleep < 6 ? 'Alto' : sleep < 7 ? 'Medio' : 'Baixo';
  const activityRiskColor = activityRisk === 'Alto' ? '#d9372e' : activityRisk === 'Medio' ? '#f2c037' : '#3cb371';
  const sleepRiskColor = sleepRisk === 'Alto' ? '#d9372e' : sleepRisk === 'Medio' ? '#f2c037' : '#3cb371';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Inicio</Text>
        <Text style={styles.sourceText}>Fonte: {dataSource}</Text>
        <View style={styles.gaugeContainer}>
          <Svg width="260" height="140" viewBox="0 0 260 140">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#d9372e" />
                <Stop offset="50%" stopColor="#f2c037" />
                <Stop offset="100%" stopColor="#3cb371" />
              </LinearGradient>
            </Defs>
            <Path d="M20,120 A110,110 0 0,1 240,120" stroke="#eee" strokeWidth="20" fill="none" strokeLinecap="round" />
            <AnimatedPath d="M20,120 A110,110 0 0,1 240,120" stroke="url(#grad)" strokeWidth="20" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
          </Svg>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{Math.round(score)}</Text>
            <Text style={styles.classification}>{classification}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.card}><Ionicons name="heart" size={28} color="#e63946" /><Text style={styles.cardTitle}>FC Media</Text><Text style={styles.cardValue}>{Math.round(fc)} bpm</Text></View>
          <View style={styles.card}><Ionicons name="walk" size={28} color="#0d6c8b" /><Text style={styles.cardTitle}>Passos</Text><Text style={styles.cardValue}>{Math.round(steps)}</Text></View>
          <View style={styles.card}><Ionicons name="moon" size={28} color="#1aa6a6" /><Text style={styles.cardTitle}>Sono</Text><Text style={styles.cardValue}>{sleep.toFixed(1)} h</Text></View>
          <View style={styles.card}><Ionicons name="stats-chart" size={28} color="#3cb371" /><Text style={styles.cardTitle}>Progresso</Text><Text style={styles.cardValue}>{Math.round(progress)}%</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analise de Risco</Text>
          <View style={styles.riskRow}><Text style={styles.riskLabel}>Atividade Fisica</Text><Text style={[styles.riskValue, { color: activityRiskColor }]}>{activityRisk}</Text></View>
          <Text style={styles.riskSub}>{Math.round(steps)} passos/dia</Text>
          <View style={styles.riskRow}><Text style={styles.riskLabel}>Padrao de Sono</Text><Text style={[styles.riskValue, { color: sleepRiskColor }]}>{sleepRisk}</Text></View>
          <Text style={styles.riskSub}>{sleep.toFixed(1)} h/noite</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendacoes</Text>
          {steps < 7000 ? <Text style={styles.recommend}>Aumente seus passos diarios gradualmente</Text> : <Text style={styles.recommend}>Continue mantendo um bom nivel de atividade</Text>}
          {fc > 85 ? <Text style={styles.recommend}>Reserve tempo para relaxar e monitorar o estresse</Text> : <Text style={styles.recommend}>Frequencia cardiaca dentro de faixa confortavel</Text>}
          {sleep < 7 ? <Text style={styles.recommend}>Mantenha um horario fixo para dormir</Text> : <Text style={styles.recommend}>Seu padrao de sono esta em boa faixa</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef5f6' },
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b', marginTop: 20, marginBottom: 4 },
  sourceText: { fontSize: 12, color: '#777', marginBottom: 10, fontStyle: 'italic' },
  gaugeContainer: { alignItems: 'center', marginBottom: 20 },
  scoreBox: { position: 'absolute', bottom: 0, alignItems: 'center' },
  scoreText: { fontSize: 30, color: '#0d6c8b', fontFamily: 'Poppins_600SemiBold' },
  classification: { fontSize: 14, color: '#333', fontFamily: 'Poppins_400Regular' },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', marginBottom: 12, elevation: 3 },
  cardTitle: { fontSize: 14, color: '#0d6c8b', fontFamily: 'Poppins_500Medium', marginTop: 6 },
  cardValue: { fontSize: 18, color: '#1aa6a6', fontFamily: 'Poppins_600SemiBold' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, color: '#0d6c8b', fontFamily: 'Poppins_600SemiBold', marginBottom: 8 },
  riskRow: { flexDirection: 'row', justifyContent: 'space-between' },
  riskLabel: { fontSize: 14, color: '#333', fontFamily: 'Poppins_400Regular' },
  riskValue: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  riskSub: { fontSize: 13, color: '#666', marginBottom: 6, fontFamily: 'Poppins_400Regular' },
  recommend: { fontSize: 13, color: '#333', marginBottom: 4, fontFamily: 'Poppins_400Regular' },
});

export default DashboardScreen;
