import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const DoctorMetricsScreen = () => {
  // filtro de período
  const [range, setRange] = useState('7d');

  // dados dinâmicos
  const [stats, setStats] = useState({
    patientsTotal: 124,
    patientsActive: 97,
    patientsRisk: 11,
    patientsNew: 6,

    consultasRealizadas: 42,
    consultasAgendadas: 18,
    consultasCanceladas: 3,
    tempoEsperaDias: 2.4,

    alertasTotal: 28,
    alertasResolvidos: 19,
    alertasCriticos: 4,
    tempoRespostaHoras: 1.8,

    scoreMedio: 72,
    melhoriaPct: 8,
    reducaoRiscoPct: 12,

    riscoBaixoPct: 62,
    riscoMedioPct: 28,
    riscoAltoPct: 10,
  });

  // animação do smartwatch piscando
  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [blinkAnim]);

  // atualização automática de dados a cada 15s
  useEffect(() => {
    const updateData = () => {
      setStats((prev) => {
        // gera pequenas variações para simular atualização
        const randOffset = (base, delta = 3) => {
          const change = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
          const val = base + change;
          return val < 0 ? 0 : val;
        };

        const clampPct = (val) => {
          if (val < 0) return 0;
          if (val > 100) return 100;
          return val;
        };

        // redistribuição de risco: manter soma ~100
        let rBaixo = clampPct(prev.riscoBaixoPct + (Math.random() * 4 - 2));
        let rMedio = clampPct(prev.riscoMedioPct + (Math.random() * 4 - 2));
        let rAlto = 100 - rBaixo - rMedio;
        if (rAlto < 0) {
          rAlto = 0;
          const total = rBaixo + rMedio;
          rBaixo = (rBaixo / total) * 100 * 0.9;
          rMedio = 100 - rBaixo;
        }

        return {
          patientsTotal: randOffset(prev.patientsTotal, 1),
          patientsActive: randOffset(prev.patientsActive, 2),
          patientsRisk: randOffset(prev.patientsRisk, 1),
          patientsNew: randOffset(prev.patientsNew, 1),

          consultasRealizadas: randOffset(prev.consultasRealizadas, 1),
          consultasAgendadas: randOffset(prev.consultasAgendadas, 1),
          consultasCanceladas: randOffset(prev.consultasCanceladas, 1),
          tempoEsperaDias: Number((prev.tempoEsperaDias + (Math.random() * 0.4 - 0.2)).toFixed(1)),

          alertasTotal: randOffset(prev.alertasTotal, 1),
          alertasResolvidos: randOffset(prev.alertasResolvidos, 1),
          alertasCriticos: randOffset(prev.alertasCriticos, 1),
          tempoRespostaHoras: Number((prev.tempoRespostaHoras + (Math.random() * 0.4 - 0.2)).toFixed(1)),

          scoreMedio: randOffset(prev.scoreMedio, 1),
          melhoriaPct: randOffset(prev.melhoriaPct, 1),
          reducaoRiscoPct: randOffset(prev.reducaoRiscoPct, 1),

          riscoBaixoPct: Number(rBaixo.toFixed(0)),
          riscoMedioPct: Number(rMedio.toFixed(0)),
          riscoAltoPct: Number(rAlto.toFixed(0)),
        };
      });
    };

    const interval = setInterval(updateData, 15000);
    return () => clearInterval(interval);
  }, []);

  // donut circular de distribuição de risco
  const RiskDistributionDonut = ({ low, mid, high }) => {
    // desenho do círculo completo
    const radius = 40;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;

    const pctToStroke = (pct) => (pct / 100) * circumference;

    // segmentos: baixo (verde), médio (amarelo), alto (vermelho)
    const lowStroke = pctToStroke(low);
    const midStroke = pctToStroke(mid);
    const highStroke = pctToStroke(high);

    return (
      <View style={styles.donutWrapper}>
        <Svg width={100} height={100} viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e0e6e8"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#2ecc71"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${lowStroke}, ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#f1c40f"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${midStroke}, ${circumference}`}
            strokeDashoffset={-lowStroke}
            strokeLinecap="round"
          />
          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e74c3c"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${highStroke}, ${circumference}`}
            strokeDashoffset={-(lowStroke + midStroke)}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutMain}>{stats.scoreMedio}</Text>
          <Text style={styles.donutLabel}>Score médio</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* HEADER FIXO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Métricas</Text>
        <Animated.View style={{ opacity: blinkAnim }}>
          <Ionicons name="watch-outline" size={22} color="#0d6c8b" />
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FILTRO DE PERÍODO */}
        <View style={styles.filterRow}>
          {['7d', '30d', '3m', '1a'].map((label) => (
            <TouchableOpacity
              key={label}
              onPress={() => setRange(label)}
              style={[
                styles.rangeBtn,
                range === label && styles.rangeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.rangeBtnText,
                  range === label && styles.rangeBtnTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ESTATÍSTICAS DE PACIENTES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pacientes</Text>
          <View style={styles.rowWrap}>
            <View style={styles.statBox}>
              <Ionicons name="people-outline" size={20} color="#0d6c8b" />
              <Text style={styles.statValue}>{stats.patientsTotal}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="person-circle-outline" size={20} color="#0d6c8b" />
              <Text style={styles.statValue}>{stats.patientsActive}</Text>
              <Text style={styles.statLabel}>Ativos</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="warning-outline" size={20} color="#e74c3c" />
              <Text style={styles.statValue}>{stats.patientsRisk}</Text>
              <Text style={styles.statLabel}>Em Risco</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="sparkles-outline" size={20} color="#0d6c8b" />
              <Text style={styles.statValue}>{stats.patientsNew}</Text>
              <Text style={styles.statLabel}>Novos</Text>
            </View>
          </View>
        </View>

        {/* CONSULTAS E AGENDAMENTOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultas e Agendamentos</Text>
          <View style={styles.rowSplit}>
            <View style={styles.splitCol}>
              <Text style={styles.splitNumber}>{stats.consultasRealizadas}</Text>
              <Text style={styles.splitLabel}>Realizadas</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={styles.splitNumber}>{stats.consultasAgendadas}</Text>
              <Text style={styles.splitLabel}>Agendadas</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={[styles.splitNumber, { color: '#e74c3c' }]}>
                {stats.consultasCanceladas}
              </Text>
              <Text style={styles.splitLabel}>Cancelamentos</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={styles.splitNumber}>{stats.tempoEsperaDias.toFixed(1)}d</Text>
              <Text style={styles.splitLabel}>Espera média</Text>
            </View>
          </View>
        </View>

        {/* GESTÃO DE ALERTAS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gestão de Alertas</Text>
          <View style={styles.rowSplit}>
            <View style={styles.splitCol}>
              <Text style={styles.splitNumber}>{stats.alertasTotal}</Text>
              <Text style={styles.splitLabel}>Total</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={[styles.splitNumber, { color: '#2ecc71' }]}>
                {stats.alertasResolvidos}
              </Text>
              <Text style={styles.splitLabel}>Resolvidos</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={[styles.splitNumber, { color: '#e74c3c' }]}>
                {stats.alertasCriticos}
              </Text>
              <Text style={styles.splitLabel}>Críticos</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={styles.splitNumber}>
                {stats.tempoRespostaHoras.toFixed(1)}h
              </Text>
              <Text style={styles.splitLabel}>Resp. média</Text>
            </View>
          </View>
        </View>

        {/* EVOLUÇÃO DA SAÚDE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolução da Saúde</Text>

          <View style={styles.evolRow}>
            {/* donut */}
            <RiskDistributionDonut
              low={stats.riscoBaixoPct}
              mid={stats.riscoMedioPct}
              high={stats.riscoAltoPct}
            />

            {/* métricas ao lado */}
            <View style={styles.evolRight}>
              <Text style={styles.evolMainScore}>
                {stats.scoreMedio}
              </Text>
              <Text style={styles.evolMainLabel}>Score médio</Text>

              <Text style={styles.evolDetail}>
                <Text style={styles.goodText}>+{stats.melhoriaPct}%</Text> melhoria
              </Text>
              <Text style={styles.evolDetail}>
                <Text style={styles.infoText}>-{stats.reducaoRiscoPct}%</Text> risco
              </Text>

              <View style={styles.riskLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
                  <Text style={styles.legendText}>Baixo {stats.riscoBaixoPct}%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f1c40f' }]} />
                  <Text style={styles.legendText}>Médio {stats.riscoMedioPct}%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                  <Text style={styles.legendText}>Alto {stats.riscoAltoPct}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ações Rápidas</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn}>
              <Ionicons name="document-text-outline" size={20} color="#0d6c8b" />
              <Text style={styles.quickText}>Relatório Mensal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn}>
              <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
              <Text style={styles.quickText}>Pacientes Críticos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn}>
              <Ionicons name="calendar-outline" size={20} color="#0d6c8b" />
              <Text style={styles.quickText}>Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn}>
              <Ionicons name="download-outline" size={20} color="#0d6c8b" />
              <Text style={styles.quickText}>Exportar Dados</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
};

export default DoctorMetricsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },

  header: {
    backgroundColor: '#eef5f6',
    paddingTop: 45,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#dfeff2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0d6c8b',
    fontWeight: '700',
    fontSize: 18,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // filtro de range
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rangeBtn: {
    borderWidth: 1,
    borderColor: '#0d6c8b',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  rangeBtnActive: {
    backgroundColor: '#0d6c8b',
  },
  rangeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0d6c8b',
  },
  rangeBtnTextActive: {
    color: '#fff',
  },

  // card base
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: '#0d6c8b',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },

  // bloco estatísticas pacientes
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f5fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dfeff2',
  },
  statValue: {
    color: '#0d6c8b',
    fontWeight: '700',
    fontSize: 18,
    marginTop: 6,
  },
  statLabel: {
    color: '#444',
    fontSize: 13,
    marginTop: 2,
  },

  // consultas & alertas
  rowSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  splitCol: {
    width: '48%',
    backgroundColor: '#f5fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dfeff2',
  },
  splitNumber: {
    color: '#0d6c8b',
    fontWeight: '700',
    fontSize: 18,
  },
  splitLabel: {
    color: '#444',
    fontSize: 13,
    marginTop: 2,
  },

  // evolução da saúde
  evolRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donutWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutMain: {
    color: '#0d6c8b',
    fontWeight: '700',
    fontSize: 20,
  },
  donutLabel: {
    color: '#666',
    fontSize: 11,
  },
  evolRight: {
    flex: 1,
    paddingLeft: 16,
  },
  evolMainScore: {
    color: '#0d6c8b',
    fontSize: 22,
    fontWeight: '700',
  },
  evolMainLabel: {
    color: '#666',
    fontSize: 13,
    marginBottom: 6,
  },
  evolDetail: {
    color: '#333',
    fontSize: 13,
    marginBottom: 4,
  },
  goodText: {
    color: '#2ecc71',
    fontWeight: '700',
  },
  infoText: {
    color: '#0d6c8b',
    fontWeight: '700',
  },
  riskLegendRow: {
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#444',
  },

  // ações rápidas
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickBtn: {
    width: '48%',
    backgroundColor: '#eef5f6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dfeff2',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#0d6c8b',
    fontWeight: '600',
    flexShrink: 1,
  },
});
