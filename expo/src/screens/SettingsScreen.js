import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [goalReminders, setGoalReminders] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [integrations, setIntegrations] = useState([{ name: 'Apple HealthKit', enabled: true }]);

  const notchOffset = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 15;

  useEffect(() => {
    const loadPrefs = async () => {
      const saved = await AsyncStorage.getItem('userPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        setDarkMode(prefs.darkMode ?? false);
        setPushNotifications(prefs.pushNotifications ?? true);
        setGoalReminders(prefs.goalReminders ?? false);
        setWeeklyReports(prefs.weeklyReports ?? true);
      }
    };
    loadPrefs();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      'userPreferences',
      JSON.stringify({ darkMode, pushNotifications, goalReminders, weeklyReports })
    );
  }, [darkMode, pushNotifications, goalReminders, weeklyReports]);

  const handleExportHealthData = async () => {
    try {
      const mockData = {
        frequenciaCardiaca: 72,
        passosDiarios: 6123,
        horasSono: 7.1,
        progressoSemanal: 66,
        sincronizacoes: integrations.map((i) => i.name),
      };

      const fileUri = `${FileSystem.documentDirectory}dados_saude.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(mockData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Exportar Dados', 'Arquivo salvo em: ' + fileUri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados.');
      console.error(error);
    }
  };

  const handleClearLocalData = async () => {
    Alert.alert('Limpar Dados Locais', 'Deseja realmente apagar todos os dados locais?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            Alert.alert('Concluído', 'Todos os dados locais foram apagados.');
          } catch (error) {
            console.error('Erro ao limpar dados locais:', error);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setTimeout(() => navigation.navigate('Login'), 300);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const addIntegration = (name) => {
    setIntegrations([...integrations, { name, enabled: true }]);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { marginTop: notchOffset }]}>Configurações</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Aparência</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="sunny-outline" size={22} color="#0d6c8b" />
            <Text style={styles.rowText}>Modo Escuro</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#0d6c8b' }} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Notificações</Text>
          </View>
          {[
            { label: 'Notificações Push', state: pushNotifications, set: setPushNotifications },
            { label: 'Lembretes de Metas', state: goalReminders, set: setGoalReminders },
            { label: 'Relatórios Semanais', state: weeklyReports, set: setWeeklyReports },
          ].map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowText}>{item.label}</Text>
              <Switch
                value={item.state}
                onValueChange={item.set}
                trackColor={{ true: '#0d6c8b' }}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Integrações</Text>
          </View>

          {integrations.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowText}>{item.name}</Text>
              <Switch value={item.enabled} trackColor={{ true: '#0d6c8b' }} />
            </View>
          ))}

          <Pressable onPress={() => setModalVisible(true)}>
            <Text style={styles.addLink}>+ Adicionar Integração</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Ações</Text>
          </View>

          <Pressable style={styles.linkRow} onPress={handleExportHealthData}>
            <Ionicons name="cloud-download-outline" size={22} color="#0d6c8b" />
            <Text style={styles.linkText}>Exportar Dados de Saúde</Text>
          </Pressable>

          <Pressable style={styles.linkRow} onPress={handleClearLocalData}>
            <Ionicons name="trash-outline" size={22} color="#c62828" />
            <Text style={[styles.linkText, { color: '#c62828' }]}>Limpar Dados Locais</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && { backgroundColor: '#ffeaea' },
            ]}
            android_ripple={{ color: '#ffcccc' }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#c62828" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </Pressable>
        </View>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Adicionar Integração</Text>
              {['Fitbit', 'Garmin', 'Samsung Health', 'Amazfit'].map((name) => (
                <Pressable
                  key={name}
                  style={styles.modalOption}
                  onPress={() => addIntegration(name)}
                >
                  <Text style={styles.modalText}>{name}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f9fa' },
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0d6c8b',
    marginBottom: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
    color: '#0d6c8b',
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  rowText: { fontSize: 16, color: '#333' },
  addLink: { color: '#0d6c8b', marginTop: 8, fontSize: 15, fontWeight: '500' },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  linkText: { marginLeft: 8, fontSize: 16, color: '#0d6c8b' },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffecec',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f3b6b6',
  },
  logoutText: { color: '#c62828', fontSize: 17, marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0d6c8b',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: { fontSize: 16, color: '#333' },
  modalCancel: {
    marginTop: 12,
    color: '#0d6c8b',
    fontWeight: '600',
  },
});
export default SettingsScreen;
