import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DashboardScreen = ({ userId }) => {
  const [score, setScore] = useState(72);
  const [fc, setFc] = useState(78);
  const [steps, setSteps] = useState(5200);
  const [sleep, setSleep] = useState(6.5);
  const [progress, setProgress] = useState(75);

  const animatedValue = useRef(new Animated.Value(0)).current;

  // ------------------------------
  // MÉTRICAS DINÂMICAS EXISTENTES
  // ------------------------------
  const radius = 110;
  const circumference = Math.PI * radius;

  const updateData = () => {
    const newScore = Math.min(100, Math.max(0, score + (Math.random() - 0.5) * 6));
    setScore(newScore);
    setFc(f => Math.min(95, Math.max(60, f + (Math.random() - 0.5) * 4)));
    setSteps(p => Math.min(8000, Math.max(3000, p + (Math.random() - 0.5) * 500)));
    setSleep(h => Math.min(8, Math.max(4.5, h + (Math.random() - 0.5) * 0.3)));
    setProgress(p => Math.min(100, Math.max(0, p + (Math.random() - 0.5) * 5)));

    Animated.timing(animatedValue, {
      toValue: newScore,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    const timer = setInterval(updateData, 5000);
    return () => clearInterval(timer);
  }, []);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const classification =
    score < 33 ? 'Risco Alto' : score < 67 ? 'Atenção' : 'Estável';

  // ------------------------------
  // RENDER ORIGINAL PRESERVADO
  // ------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Início</Text>

        {/* Gauge semicircular */}
        <View style={styles.gaugeContainer}>
          <Svg width="260" height="140" viewBox="0 0 260 140">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#d9372e" />
                <Stop offset="50%" stopColor="#f2c037" />
                <Stop offset="100%" stopColor="#3cb371" />
              </LinearGradient>
            </Defs>
            <Path
              d="M20,120 A110,110 0 0,1 240,120"
              stroke="#eee"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
            />
            <AnimatedPath
              d="M20,120 A110,110 0 0,1 240,120"
              stroke="url(#grad)"
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{Math.round(score)}</Text>
            <Text style={styles.classification}>{classification}</Text>
          </View>
        </View>

        {/* Cards */}
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Ionicons name="heart" size={28} color="#e63946" />
            <Text style={styles.cardTitle}>FC Média</Text>
            <Text style={styles.cardValue}>{Math.round(fc)} bpm</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="walk" size={28} color="#0d6c8b" />
            <Text style={styles.cardTitle}>Passos</Text>
            <Text style={styles.cardValue}>{Math.round(steps)}</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="moon" size={28} color="#1aa6a6" />
            <Text style={styles.cardTitle}>Sono</Text>
            <Text style={styles.cardValue}>{sleep.toFixed(1)} h</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="stats-chart" size={28} color="#3cb371" />
            <Text style={styles.cardTitle}>Progresso</Text>
            <Text style={styles.cardValue}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* Análise de Risco */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise de Risco</Text>
          <View style={styles.riskRow}>
            <Text style={styles.riskLabel}>Atividade Física</Text>
            <Text style={[styles.riskValue, { color: '#d9372e' }]}>Alto</Text>
          </View>
          <Text style={styles.riskSub}>4.700 passos/dia · 82% consistência</Text>

          <View style={styles.riskRow}>
            <Text style={styles.riskLabel}>Padrão de Sono</Text>
            <Text style={[styles.riskValue, { color: '#f2c037' }]}>Médio</Text>
          </View>
          <Text style={styles.riskSub}>6.5 h/noite · 70% consistência</Text>
        </View>

        {/* Recomendações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendações</Text>
          <Text style={styles.recommend}>⚡ Aumente seus passos diários gradualmente</Text>
          <Text style={styles.recommend}>🌿 Reserve tempo para relaxar</Text>
          <Text style={styles.recommend}>🕒 Mantenha um horário fixo para dormir</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef5f6' },
  container: { flex: 1, paddingHorizontal: 16 },

  title: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0d6c8b',
    marginTop: 20,
    marginBottom: 10,
  },

  gaugeContainer: { alignItems: 'center', marginBottom: 20 },
  scoreBox: { position: 'absolute', bottom: 0, alignItems: 'center' },
  scoreText: {
    fontSize: 30,
    color: '#0d6c8b',
    fontFamily: 'Poppins_600SemiBold',
  },
  classification: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins_400Regular',
  },

  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#0d6c8b',
    fontFamily: 'Poppins_500Medium',
    marginTop: 6,
  },
  cardValue: {
    fontSize: 18,
    color: '#1aa6a6',
    fontFamily: 'Poppins_600SemiBold',
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#0d6c8b',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins_400Regular',
  },
  riskValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  riskSub: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Poppins_400Regular',
  },
  recommend: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular',
  },
});

export default DashboardScreen;
