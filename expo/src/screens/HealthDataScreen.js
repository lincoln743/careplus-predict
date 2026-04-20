import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

const screenWidth = Dimensions.get('window').width;

export default function HealthDataScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const token = user?.token;
  const [weekData, setWeekData] = useState([]);
  const [dataSource, setDataSource] = useState('carregando...');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ avg: 0, max: 0, min: 0, total: 0 });

  const calcStats = (week) => {
    const values = week.map((d) => Number(d.steps || 0));
    const total = values.reduce((acc, v) => acc + v, 0);
    setStats({ avg: values.length ? total / values.length : 0, max: values.length ? Math.max(...values) : 0, min: values.length ? Math.min(...values) : 0, total });
  };

  const normalizeWeek = (days) => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return days.slice(-7).map((d, idx) => {
      const rawDate = d.date || d.day || d.label || '';
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const label = parsedDate && !Number.isNaN(parsedDate.getTime()) ? weekDays[parsedDate.getDay()] : `D${idx + 1}`;
      const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : rawDate || '--/--';
      return { label, date, steps: Number(d.totalSteps ?? d.steps ?? 0) };
    });
  };

  async function loadData() {
    if (!userId || !token) {
      setError('Sessao invalida. Faca login novamente.');
      setDataSource('erro');
      return;
    }
    try {
      setError(null);
      const response = await apiRequest(`/health/history/daily?userId=${encodeURIComponent(userId)}`, { method: 'GET', token });
      if (!response?.ok || !response?.data?.ok || !Array.isArray(response.data.days) || response.data.days.length === 0) {
        throw new Error('Sem historico diario no backend');
      }
      const week = normalizeWeek(response.data.days);
      setWeekData(week);
      calcStats(week);
      setDataSource('backend');
    } catch (err) {
      console.error('[HealthData] Erro:', err.message);
      setError('Nao foi possivel carregar os dados. Verifique a conexao.');
      setDataSource('erro');
    }
  }

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 10000);
    return () => clearInterval(t);
  }, [userId, token]);

  if (error) return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="cloud-offline-outline" size={48} color="#d9372e" />
        <Text style={{ color: '#d9372e', fontSize: 15, textAlign: 'center', marginTop: 12 }}>{error}</Text>
      </View>
    </SafeAreaView>
  );

  if (dataSource === 'carregando...') return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#0d6c8b' }}>Carregando dados...</Text>
      </View>
    </SafeAreaView>
  );

  const stepsArray = weekData.map((d) => d.steps);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeadline}>Meus Dados de Saude</Text>
        <Text style={styles.sourceText}>Fonte: {dataSource}</Text>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Estatisticas da Semana</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}><Text style={styles.statValue}>{stats.avg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text><Text style={styles.statLabel}>Media Diaria</Text></View>
            <View style={styles.statBox}><Text style={styles.statValue}>{stats.max.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text><Text style={styles.statLabel}>Maximo</Text></View>
            <View style={styles.statBox}><Text style={styles.statValue}>{stats.min.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text><Text style={styles.statLabel}>Minimo</Text></View>
            <View style={styles.statBox}><Text style={styles.statValue}>{stats.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text><Text style={styles.statLabel}>Total Semanal</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Dados Diarios</Text>
          {weekData.map((d, idx) => (
            <View key={idx} style={styles.dayRow}>
              <View style={{ flex: 1 }}><Text style={styles.dayLabel}>{d.label}</Text><Text style={styles.dayDate}>{d.date}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.daySteps}>{d.steps.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text><Text style={styles.dayStepsLabel}>passos</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Passos Semanais</Text>
          {stepsArray.length > 0 ? (
            <LineChart data={{ labels: weekData.map((d) => d.label), datasets: [{ data: stepsArray }] }} width={screenWidth - 40} height={220} chartConfig={{ backgroundGradientFrom: '#ffffff', backgroundGradientTo: '#ffffff', decimalPlaces: 0, color: () => '#0d6c8b', labelColor: () => '#0d6c8b', propsForDots: { r: '4', strokeWidth: '2', stroke: '#0d6c8b' } }} bezier style={{ borderRadius: 12, marginLeft: -10 }} />
          ) : (
            <Text style={styles.placeholder}>Sem dados para exibir</Text>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef5f6' },
  container: { flex: 1, paddingHorizontal: 16 },
  sectionHeadline: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b', marginTop: 30, marginBottom: 6 },
  sourceText: { fontSize: 12, color: '#777', fontStyle: 'italic', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, elevation: 3 },
  cardHeader: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#000', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: '#f6f8f9', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 12, marginBottom: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b' },
  statLabel: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#444' },
  dayRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 14 },
  dayLabel: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#000' },
  dayDate: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666' },
  daySteps: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: '#0d6c8b' },
  dayStepsLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },
  placeholder: { fontSize: 14, color: '#666', fontFamily: 'Poppins_400Regular' },
});
