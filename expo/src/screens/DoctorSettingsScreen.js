import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DoctorSettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [alertasCriticos, setAlertasCriticos] = useState(true);
  const [notifPacientes, setNotifPacientes] = useState(true);
  const [relatoriosSemana, setRelatoriosSemana] = useState(true);
  const [autoAgendamento, setAutoAgendamento] = useState(false);
  const [telemedicina, setTelemedicina] = useState(true);
  const [exportarDados, setExportarDados] = useState(false);

  const handleLogout = async () => {
    try {
      signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: handleLogout },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="person-circle-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Informações Profissionais</Text>
          </View>
          <Text style={styles.infoText}>Dr. Carlos Mendes</Text>
          <Text style={styles.infoSub}>Cardiologista | CRM-SP 123456</Text>
          <Text style={styles.infoSub}>Hospital CarePlus - Unidade Paulista</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color="#0d6c8b" />
            <Text style={styles.editText}>Editar Informações</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="notifications-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Notificações</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Alertas críticos</Text>
            <Switch value={alertasCriticos} onValueChange={setAlertasCriticos} thumbColor={alertasCriticos ? '#0d6c8b' : '#ccc'} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Notificações de pacientes</Text>
            <Switch value={notifPacientes} onValueChange={setNotifPacientes} thumbColor={notifPacientes ? '#0d6c8b' : '#ccc'} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Relatórios semanais</Text>
            <Switch value={relatoriosSemana} onValueChange={setRelatoriosSemana} thumbColor={relatoriosSemana ? '#0d6c8b' : '#ccc'} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="settings-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Funcionalidades</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Agendamento automático</Text>
            <Switch value={autoAgendamento} onValueChange={setAutoAgendamento} thumbColor={autoAgendamento ? '#0d6c8b' : '#ccc'} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Telemedicina</Text>
            <Switch value={telemedicina} onValueChange={setTelemedicina} thumbColor={telemedicina ? '#0d6c8b' : '#ccc'} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Exportação de dados</Text>
            <Switch value={exportarDados} onValueChange={setExportarDados} thumbColor={exportarDados ? '#0d6c8b' : '#ccc'} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f8fa' },
  scroll: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0d6c8b', marginLeft: 8 },
  infoText: { fontSize: 16, fontWeight: '600', color: '#222' },
  infoSub: { fontSize: 14, color: '#666', marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  editText: { marginLeft: 6, color: '#0d6c8b', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: { fontSize: 15, color: '#333', flex: 1, paddingRight: 12 },
  logoutButton: {
    backgroundColor: '#0d6c8b',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
});

export default DoctorSettingsScreen;
