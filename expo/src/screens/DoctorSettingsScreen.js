import React, { useState } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);
  const [alertasCriticos, setAlertasCriticos] = useState(true);
  const [notifPacientes, setNotifPacientes] = useState(true);
  const [relatoriosSemana, setRelatoriosSemana] = useState(true);
  const [autoAgendamento, setAutoAgendamento] = useState(false);
  const [telemedicina, setTelemedicina] = useState(true);
  const [exportarDados, setExportarDados] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => navigation.replace('Login') },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* INFORMAÇÕES PROFISSIONAIS */}
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

        {/* NOTIFICAÇÕES */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="notifications-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Notificações</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Alertas críticos</Text>
            <Switch
              value={alertasCriticos}
              onValueChange={setAlertasCriticos}
              thumbColor={alertasCriticos ? '#0d6c8b' : '#ccc'}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Notificações de pacientes</Text>
            <Switch
              value={notifPacientes}
              onValueChange={setNotifPacientes}
              thumbColor={notifPacientes ? '#0d6c8b' : '#ccc'}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Relatórios semanais</Text>
            <Switch
              value={relatoriosSemana}
              onValueChange={setRelatoriosSemana}
              thumbColor={relatoriosSemana ? '#0d6c8b' : '#ccc'}
            />
          </View>
        </View>

        {/* FUNCIONALIDADES */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="settings-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Funcionalidades</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Agendamento automático</Text>
            <Switch
              value={autoAgendamento}
              onValueChange={setAutoAgendamento}
              thumbColor={autoAgendamento ? '#0d6c8b' : '#ccc'}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Telemedicina</Text>
            <Switch
              value={telemedicina}
              onValueChange={setTelemedicina}
              thumbColor={telemedicina ? '#0d6c8b' : '#ccc'}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Exportação de dados</Text>
            <Switch
              value={exportarDados}
              onValueChange={setExportarDados}
              thumbColor={exportarDados ? '#0d6c8b' : '#ccc'}
            />
          </View>
        </View>

        {/* RECURSOS MÉDICOS */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="book-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Recursos Médicos</Text>
          </View>
          {[
            'Diretrizes e Protocolos',
            'Materiais de Treinamento',
            'Artigos Científicos',
            'Casos Clínicos',
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.linkRow}>
              <Ionicons name="document-text-outline" size={18} color="#0d6c8b" />
              <Text style={styles.linkText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* APARÊNCIA */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="color-palette-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Aparência</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Modo Escuro</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? '#0d6c8b' : '#ccc'}
            />
          </View>
        </View>

        {/* SUPORTE E SEGURANÇA */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Suporte e Segurança</Text>
          </View>
          {[
            'Suporte Técnico',
            'Política de Privacidade',
            'Termos de Uso Médico',
            'Auditoria de Acesso',
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.linkRow}>
              <Ionicons name="help-circle-outline" size={18} color="#0d6c8b" />
              <Text style={styles.linkText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTÃO SAIR */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorSettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f8fa',
    paddingTop: 12,
  },
  scroll: { padding: 16 },
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0d6c8b', marginLeft: 8 },
  infoText: { fontSize: 15, fontWeight: '600', color: '#333' },
  infoSub: { fontSize: 13, color: '#555', marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  editText: { color: '#0d6c8b', marginLeft: 6, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  switchLabel: { fontSize: 14, color: '#333' },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  linkText: { fontSize: 14, color: '#0d6c8b', marginLeft: 8, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#0d6c8b',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});
