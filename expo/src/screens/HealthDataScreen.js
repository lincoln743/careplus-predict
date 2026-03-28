import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import healthKitService from '../services/healthKitService';

const screenWidth = Dimensions.get('window').width;

export default function HealthDataScreen() {
  const [weekData, setWeekData] = useState([]);
  const [stats, setStats] = useState({
    avg: 0,
    max: 0,
    min: 0,
    total: 0,
  });

  async function loadData() {
    const { week, stats } = await healthKitService.getLastWeekSteps();
    setWeekData(week);
    setStats(stats);
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stepsArray = weekData.map((d) => d.steps);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeadline}>Meus Dados de Saúde</Text>

        {/* Estatísticas da Semana */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Estatísticas da Semana</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {stats.avg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Média Diária</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {stats.max.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Máximo</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {stats.min.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Mínimo</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {stats.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Total Semanal</Text>
            </View>
          </View>
        </View>

        {/* Dados Diários */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Dados Diários</Text>

          {weekData.map((d, idx) => (
            <View key={idx} style={styles.dayRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayLabel}>{d.label}</Text>
                <Text style={styles.dayDate}>{d.date}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.daySteps}>
                  {d.steps.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={styles.dayStepsLabel}>passos</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recomendações */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Recomendações</Text>
          <Text style={styles.bullet}>• Tente alcançar 10.000 passos diários</Text>
          <Text style={styles.bullet}>
            • Sua média: {stats.avg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} passos
          </Text>
          <Text style={styles.bullet}>• 💪 Você está no caminho certo!</Text>
        </View>

        {/* Gráfico de Passos Semanais */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Passos Semanais</Text>

          {stepsArray.length > 0 ? (
            <LineChart
              data={{
                labels: weekData.map((d) => d.label),
                datasets: [{ data: stepsArray }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#0d6c8b',
                labelColor: () => '#0d6c8b',
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#0d6c8b',
                },
              }}
              bezier
              style={{ borderRadius: 12, marginLeft: -10 }}
            />
          ) : (
            <Text style={styles.placeholder}>Carregando gráfico…</Text>
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

  sectionHeadline: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0d6c8b',
    marginTop: 30, // 🔹 afastamento ajustado para evitar sobreposição com câmera
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
  },

  cardHeader: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#000',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statBox: {
    width: '48%',
    backgroundColor: '#f6f8f9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0d6c8b',
  },

  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#444',
  },

  dayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
  },

  dayLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#000',
  },

  dayDate: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },

  daySteps: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0d6c8b',
  },

  dayStepsLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },

  bullet: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#000',
    marginBottom: 6,
  },

  placeholder: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
});
