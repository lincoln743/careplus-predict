import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getDoctorPatients } from '../services/doctor';

const DoctorPatientsScreen = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [filter, setFilter] = useState('Todos');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [dataSource, setDataSource] = useState('carregando...');
  const [error, setError] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);

  const normalizePatients = (rawData) => {
    const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.patients) ? rawData.patients : [];
    return list.map((p, index) => {
      const rawStatus = String(p.status ?? p.statusLabel ?? p.riskStatus ?? 'Acompanhamento');
      const rawStatusLower = rawStatus.toLowerCase();
      const online = rawStatusLower.includes('online') || rawStatusLower.includes('ativo hoje') || rawStatusLower.includes('active_today') || Boolean(p.online ?? false);
      let status = rawStatus;
      if (rawStatusLower.includes('online') || rawStatusLower.includes('ativo hoje')) status = 'Acompanhamento';
      else if (rawStatusLower.includes('offline')) status = 'Inativo';
      return {
        id: String(p.id ?? index + 1),
        name: p.name ?? p.nome ?? `Paciente ${index + 1}`,
        age: Number(p.age ?? p.idade ?? 0),
        score: Number(p.score ?? p.riskScore ?? p.healthScore ?? 0),
        steps: Number(p.steps ?? p.passos ?? 0),
        sleep: String(p.sleep ?? p.sono ?? 0),
        heartRate: Number(p.heartRate ?? p.fc ?? p.bpm ?? 0),
        status,
        alerts: Array.isArray(p.alerts) ? p.alerts : [],
        online,
        lastUpdate: p.lastUpdate ? new Date(p.lastUpdate) : p.lastSeen ? new Date(p.lastSeen) : new Date(),
      };
    });
  };

  const loadPatients = async () => {
    try {
      setError(null);
      const list = await getDoctorPatients(token);
      const normalized = normalizePatients(list);
      if (!normalized.length) throw new Error('Sem pacientes retornados pelo backend');
      setPatients(normalized);
      setDataSource('backend');
      const now = new Date();
      setLastUpdateTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('[DoctorPatients] Erro:', err.message);
      setError('Nao foi possivel carregar pacientes.');
      setDataSource('erro');
    }
  };

  useEffect(() => {
    loadPatients();
    const interval = setInterval(loadPatients, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const filteredPatients = filter === 'Todos' ? patients : patients.filter((p) => p.status === filter);
  const formatLastUpdate = (date) => { const h = Math.floor((new Date() - new Date(date)) / 3600000); return h === 0 ? 'ha instantes' : `ha ${h}h`; };

  if (error) return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Pacientes</Text></View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="cloud-offline-outline" size={48} color="#d9372e" />
        <Text style={{ color: '#d9372e', fontSize: 15, textAlign: 'center', marginTop: 12 }}>{error}</Text>
        <TouchableOpacity onPress={loadPatients} style={{ marginTop: 20, backgroundColor: '#0d6c8b', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Pacientes</Text></View>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
          {['Todos', 'Alto Risco', 'Com Alertas', 'Acompanhamento', 'Inativo'].map((item) => (
            <TouchableOpacity key={item} style={[styles.filterButton, filter === item && styles.filterButtonActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: '#777' }}>Carregando pacientes...</Text></View>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.name}>{item.name}</Text>
                <Animated.View style={[styles.statusDot, { backgroundColor: item.online ? '#2ecc71' : '#e74c3c', opacity: pulseAnim }]} />
                {item.online ? <Animated.Text style={[styles.onlineText, { opacity: pulseAnim }]}>Ativo agora</Animated.Text> : <Text style={styles.offlineText}>Offline - {formatLastUpdate(item.lastUpdate)}</Text>}
              </View>
              <Text style={styles.age}>{item.age} anos</Text>
            </View>
            <View style={styles.metrics}>
              <Text style={styles.metricText}>Score: {item.score}</Text>
              <View style={styles.metricRow}><Ionicons name="walk-outline" size={16} color="#0d6c8b" /><Text style={styles.metricLabel}>{item.steps} passos</Text></View>
              <View style={styles.metricRow}><Ionicons name="moon-outline" size={16} color="#0d6c8b" /><Text style={styles.metricLabel}>{item.sleep} h sono</Text></View>
              <View style={styles.metricRow}><Ionicons name="heart-outline" size={16} color="#e63946" /><Text style={styles.metricLabel}>{item.heartRate} bpm</Text></View>
            </View>
            {item.alerts.length > 0 && (
              <View style={styles.alertBadge}><Ionicons name="warning-outline" size={14} color="#fff" /><Text style={styles.alertText}>{item.alerts.length} alerta(s)</Text></View>
            )}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble-outline" size={20} color="#0d6c8b" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}><Ionicons name="calendar-outline" size={20} color="#0d6c8b" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedPatient(item); setModalVisible(true); }}><Ionicons name="stats-chart-outline" size={20} color="#0d6c8b" /></TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 110 }}
      />
      <View style={styles.updateFooter}>
        <Text style={styles.updateText}>Ultima atualizacao: {lastUpdateTime || '...'}</Text>
        <Text style={styles.updateSource}>Fonte: {dataSource}</Text>
      </View>
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPatient && (
              <>
                <Text style={styles.modalTitle}>Relatorio de {selectedPatient.name}</Text>
                <Text style={styles.modalInfo}>Score atual: {selectedPatient.score}</Text>
                <Text style={styles.modalInfo}>Passos: {selectedPatient.steps} / Sono: {selectedPatient.sleep}h / FC: {selectedPatient.heartRate} bpm</Text>
                <Text style={styles.modalInfo}>Alertas: {selectedPatient.alerts.join(', ') || 'Nenhum'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}><Text style={styles.closeText}>Fechar</Text></TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DoctorPatientsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  header: { backgroundColor: '#eef5f6', paddingTop: 45, paddingBottom: 8, alignItems: 'center', borderBottomColor: '#dfeff2', borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0d6c8b' },
  filterContainer: { height: 52, justifyContent: 'center', borderBottomWidth: 0.5, borderColor: '#e0ebed', backgroundColor: '#f7fafb' },
  filterButton: { borderWidth: 1, borderColor: '#0d6c8b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginHorizontal: 4 },
  filterButtonActive: { backgroundColor: '#0d6c8b' },
  filterText: { color: '#0d6c8b', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 14, marginVertical: 8, borderRadius: 16, padding: 14, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#0d6c8b', marginRight: 6 },
  onlineText: { fontSize: 11, color: '#6ab04c', marginLeft: 4 },
  offlineText: { fontSize: 11, color: '#e74c3c', marginLeft: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 2 },
  age: { fontSize: 13, color: '#777' },
  metrics: { marginTop: 8 },
  metricText: { color: '#0d6c8b', fontWeight: '600', marginBottom: 4 },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metricLabel: { fontSize: 13, color: '#444', marginLeft: 6 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e63946', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 8 },
  alertText: { color: '#fff', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, borderTopWidth: 1, borderTopColor: '#dfeff2', paddingTop: 8 },
  actionBtn: { padding: 6 },
  updateFooter: { alignItems: 'center', paddingBottom: 10 },
  updateText: { fontSize: 12, color: '#777', fontStyle: 'italic' },
  updateSource: { fontSize: 11, color: '#999', marginTop: 2 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0d6c8b', marginBottom: 10 },
  modalInfo: { fontSize: 14, color: '#333', marginBottom: 4 },
  closeBtn: { backgroundColor: '#0d6c8b', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8, marginTop: 10 },
  closeText: { color: '#fff', fontWeight: '700' },
});
