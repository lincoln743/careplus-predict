import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated, Linking, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const notchOffset = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 15;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const openEmail = () => Linking.openURL('mailto:suporte@careplus.com.br');
  const openWebsite = () => Linking.openURL('https://www.careplus.com.br');

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={[styles.appTitle, { marginTop: notchOffset }]}>CarePlus Predict</Text>
        <Text style={styles.version}>Versão 1.0.0</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎯 Nossa Missão</Text>
          <Text style={styles.text}>
            O CarePlus Predict transforma dados de saúde em insights acionáveis, ajudando você
            a prevenir problemas de saúde antes que eles aconteçam.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>✨ Funcionalidades</Text>
          <View style={styles.featureItem}>
            <Ionicons name="stats-chart-outline" size={22} color="#0d6c8b" />
            <View>
              <Text style={styles.featureTitle}>Monitoramento Contínuo</Text>
              <Text style={styles.featureText}>
                Acompanhe passos, sono e frequência cardíaca em tempo real.
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="hardware-chip-outline" size={22} color="#0d6c8b" />
            <View>
              <Text style={styles.featureTitle}>IA Preditiva</Text>
              <Text style={styles.featureText}>
                Alertas inteligentes baseados em algoritmos de machine learning.
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="medkit-outline" size={22} color="#0d6c8b" />
            <View>
              <Text style={styles.featureTitle}>Acompanhamento Médico</Text>
              <Text style={styles.featureText}>
                Seu médico acompanha seu progresso e intervém quando necessário.
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flag-outline" size={22} color="#0d6c8b" />
            <View>
              <Text style={styles.featureTitle}>Metas Personalizadas</Text>
              <Text style={styles.featureText}>
                Desafios de saúde adaptados ao seu perfil e progresso.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔒 Segurança e Privacidade</Text>
          <Text style={styles.text}>
            Seus dados de saúde são criptografados e protegidos de acordo com a LGPD.
            Você tem total controle sobre quais informações compartilhar.
          </Text>
          <Pressable onPress={openWebsite}>
            <Text style={styles.linkText}>Política de Privacidade</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📞 Contato</Text>
          <Pressable style={styles.button} onPress={openEmail}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Suporte por Email</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={openWebsite}>
            <Ionicons name="globe-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Visitar Website</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>👨‍💻 Equipe de Desenvolvimento</Text>
          <Text style={styles.textCenter}>
            Desenvolvido com ❤️ por uma equipe apaixonada por tecnologia e saúde preventiva.
          </Text>
          <View style={styles.team}>
            <View>
              <Text style={styles.teamLabel}>Desenvolvimento</Text>
              <Text style={styles.teamValue}>Equipe NextGen FIAP</Text>
            </View>
            <View>
              <Text style={styles.teamLabel}>Design</Text>
              <Text style={styles.teamValue}>Equipe NextGen</Text>
            </View>
            <View>
              <Text style={styles.teamLabel}>Saúde</Text>
              <Text style={styles.teamValue}>Especialistas CarePlus</Text>
            </View>
          </View>
          <Text style={styles.copy}>© 2024 CarePlus Predict. Todos os direitos reservados.</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6fbfd' },
  container: { flex: 1, padding: 16 },
  appTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0d6c8b',
    textAlign: 'center',
  },
  version: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0d6c8b', marginBottom: 8 },
  text: { fontSize: 15, color: '#333', lineHeight: 22 },
  linkText: {
    color: '#0d6c8b',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: '#0d6c8b' },
  featureText: { fontSize: 14, color: '#444', flexShrink: 1 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#0d6c8b',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  buttonText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  footer: { marginTop: 10, marginBottom: 20 },
  textCenter: { textAlign: 'center', fontSize: 14, color: '#444', marginBottom: 10 },
  team: { marginTop: 6 },
  teamLabel: { fontSize: 13, color: '#666' },
  teamValue: { fontSize: 14, color: '#0d6c8b', fontWeight: '500' },
  copy: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 },
});
export default AboutScreen;
