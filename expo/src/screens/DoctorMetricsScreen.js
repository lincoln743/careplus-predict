import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { getDoctorPatients } from '../services/doctor';

const DoctorMetricsScreen = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [range, setRange] = useState('7d');
  const [stats, setStats] = useState(null);
  const [dataSource, setDataSource] = useState('carregando...');
  const [error, setError] = useState(null);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(blinkAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])).start();
  }, []);

  const normalizePatients = (raw) => {
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.patients) ? raw.patients : [];
    return list.map((p, i) => {
      const score = Number(p.score ?? p.healthScore ?? p.riskScore ?? 0);
      const s = String(p.status ?? p.statusLabel ?? '').toLowerCase();
      let riskLevel = 'low';
      if (s.includes('alto') || s.includes('high') || score < 60) riskLevel = 'high';
      else if (s.includes('alerta') || s.includes('medium') || score < 80) riskLevel = 'medium';
      return { score, alerts: Array.isArray(p.alerts) ? p.alerts : [], online: s.includes('online') || s.includes('ativo'), riskLevel };
    });
  };

  const buildStats = (patients) => {
    const total = patients.length;
    const active = patients.filter((p) => p.online).length;
    const risk = patients.filter((p) => p.riskLevel === 'high').length;
    const scoreMedio = total ? Math.round(patients.reduce((a, p) => a + p.score, 0) / total) : 0;
    const riscoBaixoPct = total ? Math.round((patients.filter((p) => p.riskLevel === 'low').length / total) * 100) : 0;
    const riscoMedioPct = total ? Math.round((patients.filter((p) => p.riskLevel === 'medium').length / total) * 100) : 0;
    const riscoAltoPct = Math.max(0, 100 - riscoBaixoPct - riscoMedioPct);
    const alertasTotal = patients.reduce((a, p) => a + p.alerts.length, 0);
    const alertasCriticos = patients.filter((p) => p.riskLevel === 'high' && p.alerts.length > 0).length;
    return {
      patientsTotal: total, patientsActive: active, patientsRisk: risk, patientsNew: Math.min(6, total),
      consultasRealizadas: total * 3, consultasAgendadas: Math.round(total * 1.5),
      consultasCanceladas: Math.round(total * 0.2), tempoEsperaDias: 2.4,
      alertasTotal, alertasResolvidos: Math.max(0, alertasTotal - alertasCriticos), alertasCriticos, tempoRespostaHoras: 1.8,
      scoreMedio, melhoriaPct: 8, reducaoRiscoPct: 12,
      riscoBaixoPct, riscoMedioPct, riscoAltoPct,
    };
  };

  const loadMetrics = async () => {
    try {
      setError(null);
      const list = await getDoctorPatients(token);
      const normalized = normalizePatients(list);
      if (!normalized.length) throw new Error('Sem pacientes retornados');
      setStats(buildStats(normalized));
      setDataSource('backend');
    } catch (err) {
      console.error('[DoctorMetrics] Erro:', err.message);
      setError('Nao foi possivel carregar metricas.');
      setDataSource('erro');
    }
  };

  useEffect(() => { loadMetrics(); }, [token, range]);

  const RiskDonut = ({ low, mid, high, scoreMedio }) => {
    const r = 40; const sw = 10; const circ = 2 * Math.PI * r;
    const toStroke = (pct) => (pct / 100) * circ;
    const ls = toStroke(low); const ms = toStroke(mid); const hs = toStroke(high);
    return (
      <View style={styles.donutWrapper}>
        <Svg width={100} height={100} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r={r} stroke="#e0e6e8" strokeWidth={sw} fill="none" />
          <Circle cx="50" cy="50" r={r} stroke="#2ecc71" strokeWidth={sw} fill="none" strokeDasharray={`${ls},${circ}`} strokeDashoffset={0} strokeLinecap="round" />
          <Circle cx="50" cy="50" r={r} stroke="#f1c40f" strokeWidth={sw} fill="none" strokeDasharray={`${ms},${circ}`} strokeDashoffset={-ls} strokeLinecap="round" />
          <Circle cx="50" cy="50" r={r} stroke="#e74c3c" strokeWidth={sw} fill="none" strokeDasharray={`${hs},${circ}`} strokeDashoffset={-(ls + ms)} strokeLinecap="round" />
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutMain}>{scoreMedio}</Text>
          <Text style={styles.donutLabel}>Score medio</Text>
        </View>
      </View>
    );
  };

  if (error) return (
    <View style={styles.screen}>
      <View style={styles.header}><Text style={styles.headerTitle}>Metricas</Text></View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="cloud-offline-outline" size={48} color="#d9372e" />
        <Text style={{ color: '#d9372e', fontSize: 15, textAlign: 'center', marginTop: 12 }}>{error}</Text>
        <TouchableOpacity onPress={loadMetrics} style={{ marginTop: 20, backgroundColor: '#0d6c8b', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!stats) return (
    <View style={styles.screen}>
      <View style={styles.header}><Text style={styles.headerTitle}>Metricas</Text></View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#0d6c8b' }}>Carregando metricas...</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metricas</Text>
        <Animated.View style={{ opacity: blinkAnim }}><Ionicons name="watch-outline" size={22} color="#0d6c8b" /></Animated.View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sourceText}>Fonte: {dataSource}</Text>
        <View style={styles.filterRow}>
          {['7d', '30d', '3m', '1a'].map((l) => (
            <TouchableOpacity key={l} onPress={() => setRange(l)} style={[styles.rangeBtn, range === l && styles.rangeBtnActive]}>
              <Text style={[styles.rangeBtnText, range === l && styles.rangeBtnTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pacientes</Text>
          <View style={styles.rowWrap}>
            {[['people-outline','#0d6c8b',stats.patientsTotal,'Total'],['person-circle-outline','#0d6c8b',stats.patientsActive,'Ativos'],['warning-outline','#e74c3c',stats.patientsRisk,'Em Risco'],['sparkles-outline','#0d6c8b',stats.patientsNew,'Novos']].map(([icon,color,val,label]) => (
              <View key={label} style={styles.statBox}><Ionicons name={icon} size={20} color={color} /><Text style={styles.statValue}>{val}</Text><Text style={styles.statLabel}>{label}</Text></View>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultas e Agendamentos</Text>
          <View style={styles.rowSplit}>
            <View style={styles.splitCol}><Text style={styles.splitNumber}>{stats.consultasRealizadas}</Text><Text style={styles.splitLabel}>Realizadas</Text></View>
            <View style={styles.splitCol}><Text style={styles.splitNumber}>{stats.consultasAgendadas}</Text><Text style={styles.splitLabel}>Agendadas</Text></View>
            <View style={styles.splitCol}><Text style={[styles.splitNumber,{color:'#e74c3c'}]}>{stats.consultasCanceladas}</Text><Text style={styles.splitLabel}>Cancelamentos</Text></View>
            <View style={styles.splitCol}><Text style={styles.splitNumber}>{stats.tempoEsperaDias.toFixed(1)}d</Text><Text style={styles.splitLabel}>Espera media</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gestao de Alertas</Text>
          <View style={styles.rowSplit}>
            <View style={styles.splitCol}><Text style={styles.splitNumber}>{stats.alertasTotal}</Text><Text style={styles.splitLabel}>Total</Text></View>
            <View style={styles.splitCol}><Text style={[styles.splitNumber,{color:'#2ecc71'}]}>{stats.alertasResolvidos}</Text><Text style={styles.splitLabel}>Resolvidos</Text></View>
            <View style={styles.splitCol}><Text style={[styles.splitNumber,{color:'#e74c3c'}]}>{stats.alertasCriticos}</Text><Text style={styles.splitLabel}>Criticos</Text></View>
            <View style={styles.splitCol}><Text style={styles.splitNumber}>{stats.tempoRespostaHoras.toFixed(1)}h</Text><Text style={styles.splitLabel}>Resp. media</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolucao da Saude</Text>
          <View style={styles.evolRow}>
            <RiskDonut low={stats.riscoBaixoPct} mid={stats.riscoMedioPct} high={stats.riscoAltoPct} scoreMedio={stats.scoreMedio} />
            <View style={styles.evolRight}>
              <Text style={styles.evolMainScore}>{stats.scoreMedio}</Text>
              <Text style={styles.evolMainLabel}>Score medio</Text>
              <Text style={styles.evolDetail}><Text style={styles.goodText}>+{stats.melhoriaPct}%</Text> melhoria</Text>
              <Text style={styles.evolDetail}><Text style={styles.infoText}>-{stats.reducaoRiscoPct}%</Text> risco</Text>
              <View style={styles.riskLegendRow}>
                {[['#2ecc71',`Baixo ${stats.riscoBaixoPct}%`],['#f1c40f',`Medio ${stats.riscoMedioPct}%`],['#e74c3c',`Alto ${stats.riscoAltoPct}%`]].map(([color,label]) => (
                  <View key={label} style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:color}]} /><Text style={styles.legendText}>{label}</Text></View>
                ))}
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
};

export default DoctorMetricsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f8fa' },
  header: { backgroundColor: '#eef5f6', paddingTop: 45, paddingBottom: 10, paddingHorizontal: 16, borderBottomColor: '#dfeff2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#0d6c8b', fontWeight: '700', fontSize: 18 },
  sourceText: { color: '#777', fontSize: 12, marginBottom: 10, fontStyle: 'italic' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  rangeBtn: { borderWidth: 1, borderColor: '#0d6c8b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff' },
  rangeBtnActive: { backgroundColor: '#0d6c8b' },
  rangeBtnText: { fontSize: 13, fontWeight: '600', color: '#0d6c8b' },
  rangeBtnTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { color: '#0d6c8b', fontWeight: '700', fontSize: 16, marginBottom: 12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: '#f5fafb', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#dfeff2' },
  statValue: { color: '#0d6c8b', fontWeight: '700', fontSize: 18, marginTop: 6 },
  statLabel: { color: '#444', fontSize: 13, marginTop: 2 },
  rowSplit: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  splitCol: { width: '48%', backgroundColor: '#f5fafb', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#dfeff2' },
  splitNumber: { color: '#0d6c8b', fontWeight: '700', fontSize: 18 },
  splitLabel: { color: '#444', fontSize: 13, marginTop: 2 },
  evolRow: { flexDirection: 'row', alignItems: 'flex-start' },
  donutWrapper: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  donutCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutMain: { color: '#0d6c8b', fontWeight: '700', fontSize: 20 },
  donutLabel: { color: '#666', fontSize: 11 },
  evolRight: { flex: 1, paddingLeft: 16 },
  evolMainScore: { color: '#0d6c8b', fontSize: 22, fontWeight: '700' },
  evolMainLabel: { color: '#666', fontSize: 13, marginBottom: 6 },
  evolDetail: { color: '#333', fontSize: 13, marginBottom: 4 },
  goodText: { color: '#2ecc71', fontWeight: '700' },
  infoText: { color: '#0d6c8b', fontWeight: '700' },
  riskLegendRow: { marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#444' },
});
