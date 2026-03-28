import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, Animated, Dimensions, Platform, StatusBar,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getLatestPatientHealth } from '../services/patient';
import { apiRequest } from '../services/apiClient';

const screenWidth = Dimensions.get('window').width;
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function MetricsScreen() {
  const { userId, token } = useAuth();

  const [metrics, setMetrics] = useState({
    fc: 71,
    steps: generateFallbackWeekSteps(),
    sleep: generateFallbackWeekSleep(),
    progress: 0.6,
  });
  const [dataSource, setDataSource] = useState('fallback demo');

  const syncAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(metrics.progress)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(syncAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(syncAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [syncAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: metrics.progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [metrics.progress, progressAnim]);

  const loadRealMetrics = async () => {
    try {
      const latestResponse = await getLatestPatientHealth(userId, token);
      const dailyResponse = await apiRequest(`/health/history/daily?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        token,
      });

      if (!latestResponse?.ok || !latestResponse?.data?.ok) {
        throw new Error('latest sem dados');
      }

      const latest = latestResponse.data.data || {};
      const days = dailyResponse?.ok && dailyResponse?.data?.ok && Array.isArray(dailyResponse.data.days)
        ? dailyResponse.data.days
        : [];

      if (!days.length) {
        throw new Error('daily sem dados');
      }

      const weekSteps = normalizeWeekSteps(days);
      const weekSleep = normalizeWeekSleep(days);

      const avgSteps = weekSteps.reduce((a, b) => a + b.steps, 0) / weekSteps.length;
      const avgSleep = weekSleep.reduce((a, b) => a + b.hours, 0) / weekSleep.length;
      const fc = Number(latest.heartRate ?? latest.fc ?? 71);

      const progress = clamp(((avgSteps / 8000) * 0.6) + ((avgSleep / 8) * 0.4), 0, 1);

      setMetrics({
        fc,
        steps: weekSteps,
        sleep: weekSleep,
        progress,
      });

      setDataSource('backend');
    } catch (error) {
      console.log('PATIENT METRICS FALLBACK:', error);
      setMetrics({
        fc: 71,
        steps: generateFallbackWeekSteps(),
        sleep: generateFallbackWeekSleep(),
        progress: 0.6,
      });
      setDataSource('fallback demo');
    }
  };

  useEffect(() => {
    loadRealMetrics();
    const timer = setInterval(() => {
      loadRealMetrics();
    }, 5000);
    return () => clearInterval(timer);
  }, [userId, token]);

  const opacity = syncAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const stepsChartData = { labels: metrics.steps.map((d) => d.day), datasets: [{ data: metrics.steps.map((d) => d.steps) }] };
  const sleepChartData = { labels: metrics.sleep.map((d) => d.day), datasets: [{ data: metrics.sleep.map((d) => d.hours), color: () => '#0d6c8b', strokeWidth: 2 }] };
  const avgSteps = metrics.steps.reduce((a, b) => a + b.steps, 0) / metrics.steps.length;
  const totalSteps = metrics.steps.reduce((a, b) => a + b.steps, 0);

  const R = 130;
  const arcLength = Math.PI * R;
  const ARC_D = "M20,140 A130,130 0 0,1 280,140";
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [arcLength, 0],
  });

  const notchOffset = Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 20;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { marginTop: notchOffset }]}>
          <View>
            <Text style={styles.title}>Métricas de Saúde</Text>
            <Text style={styles.sourceText}>Fonte: {dataSource}</Text>
          </View>
          <Animated.View style={{ opacity, marginRight: 10 }}>
            <Ionicons name="watch-outline" size={26} color="#0d6c8b" />
          </Animated.View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Resumo de Saúde</Text>
          <View style={styles.summaryGrid}>
            <SummaryItem emoji="💗" value={metrics.fc} label="FC Média" />
            <SummaryItem emoji="👟" value={avgSteps.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} label="Passos/Dia" />
            <SummaryItem emoji="😴" value={`${(metrics.sleep.reduce((a, b) => a + b.hours, 0) / metrics.sleep.length).toFixed(1)}h`} label="Sono/Dia" />
            <SummaryItem emoji="📈" value={`${(metrics.progress * 100).toFixed(0)}%`} label="Progresso" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Progresso Semanal</Text>
          <View style={styles.donutContainer}>
            <Svg height="160" width="300" viewBox="0 0 300 160">
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#0d6c8b" />
                  <Stop offset="100%" stopColor="#0d6c8b" />
                </LinearGradient>
              </Defs>
              <Path d="M20,140 A130,130 0 0,1 280,140" stroke="#e6e6e6" strokeWidth="18" fill="none" strokeLinecap="round" />
              <AnimatedPath
                d={ARC_D}
                stroke="url(#grad)"
                strokeWidth="18"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
              />
            </Svg>
            <Text style={styles.percentText}>{Math.round(metrics.progress * 100)}%</Text>
          </View>
          <Text style={styles.progressText}>{Math.round(metrics.progress * 100)}% da meta semanal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Atividade Física - Última Semana</Text>
          <BarChart
            data={stepsChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: () => '#0d6c8b',
              labelColor: () => '#000',
              decimalPlaces: 0,
            }}
            style={{ borderRadius: 12, marginLeft: -10 }}
          />
          <View style={styles.footerStats}>
            <View>
              <Text style={styles.footerValue}>{totalSteps.toLocaleString('pt-BR')}</Text>
              <Text style={styles.footerLabel}>Total de Passos</Text>
            </View>
            <View>
              <Text style={styles.footerValue}>{avgSteps.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
              <Text style={styles.footerLabel}>Média Diária</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Padrão de Sono - Última Semana</Text>
          <LineChart
            data={sleepChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: () => '#0d6c8b',
              labelColor: () => '#000',
              decimalPlaces: 1,
            }}
            bezier
            style={{ borderRadius: 12, marginLeft: -10 }}
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SummaryItem = ({ emoji, value, label }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

function normalizeWeekSteps(days) {
  return days.slice(-7).map((d, idx) => ({
    day: getDayLabel(d.date, idx),
    steps: Number(d.totalSteps ?? d.steps ?? 0),
  }));
}

function normalizeWeekSleep(days) {
  return days.slice(-7).map((d, idx) => ({
    day: getDayLabel(d.date, idx),
    hours: Number(d.avgSleep ?? d.sleep ?? 0),
  }));
}

function getDayLabel(rawDate, idx) {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const parsed = rawDate ? new Date(rawDate) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return labels[parsed.getDay()];
  }
  return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx] || `D${idx + 1}`;
}

function generateFallbackWeekSteps() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const values = [5200, 6100, 4800, 7300, 6900, 4200, 5600];
  return days.map((day, i) => ({ day, steps: values[i] }));
}

function generateFallbackWeekSleep() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const values = [6.2, 6.8, 5.9, 7.1, 6.7, 7.4, 6.5];
  return days.map((day, i) => ({ day, hours: values[i] }));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef5f6' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b' },
  sourceText: { fontSize: 12, color: '#777', fontStyle: 'italic', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, elevation: 3 },
  cardHeader: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#000', marginBottom: 16 },
  donutContainer: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  percentText: { position: 'absolute', top: '48%', fontSize: 22, color: '#0d6c8b', fontFamily: 'Poppins_600SemiBold' },
  progressText: { textAlign: 'center', marginTop: -5, fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#000' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  summaryItem: { width: '48%', backgroundColor: '#f6f8f9', borderRadius: 12, paddingVertical: 16, marginBottom: 12, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b' },
  summaryLabel: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#444' },
  emoji: { fontSize: 24, marginBottom: 4 },
  footerStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  footerValue: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b', textAlign: 'center' },
  footerLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#555', textAlign: 'center' },
});
