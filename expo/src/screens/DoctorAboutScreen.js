import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DoctorAboutScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>CarePlus Predict</Text>
          <Text style={styles.version}>Versão 1.0.0</Text>
        </View>

        {/* MISSÃO */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="heart-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Nossa Missão</Text>
          </View>
          <Text style={styles.text}>
            O CarePlus Predict Médico utiliza inteligência preditiva para transformar dados clínicos em ações preventivas,
            promovendo saúde proativa e suporte avançado para decisões médicas.
          </Text>
        </View>

        {/* FUNCIONALIDADES */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="medkit-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Funcionalidades para Médicos</Text>
          </View>
          {[
            { icon: 'analytics-outline', title: 'IA para Diagnóstico Preditivo', desc: 'Identificação antecipada de riscos e suporte à decisão clínica.' },
            { icon: 'people-outline', title: 'Gestão de Pacientes', desc: 'Monitoramento e acompanhamento centralizado dos pacientes.' },
            { icon: 'bar-chart-outline', title: 'Analytics Avançado', desc: 'Painéis de performance e estatísticas de saúde populacional.' },
            { icon: 'alert-circle-outline', title: 'Sistema de Alertas', desc: 'Notificações automáticas para eventos clínicos críticos.' },
            { icon: 'document-text-outline', title: 'Prescrição Eletrônica', desc: 'Integração segura com o prontuário do paciente.' },
          ].map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Ionicons name={item.icon} size={18} color="#0d6c8b" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* RECURSOS MÉDICOS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="book-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Recursos Médicos</Text>
          </View>
          {[
            'Treinamento Médico',
            'Diretrizes Clínicas',
            'Portal de Pesquisa',
            'Casos Clínicos',
          ].map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Ionicons name="document-text-outline" size={18} color="#0d6c8b" />
              <Text style={styles.link}>{item}</Text>
            </View>
          ))}
        </View>

        {/* SEGURANÇA E CONFORMIDADE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Segurança e Conformidade</Text>
          </View>
          <Text style={styles.text}>
            Todos os dados são criptografados e tratados conforme as normas LGPD e padrões internacionais de interoperabilidade (HL7, FHIR).
          </Text>
        </View>

        {/* INTEGRAÇÕES */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="link-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Integrações</Text>
          </View>
          {[
            'Apple HealthKit',
            'Sistemas TISS / PACS / RIS',
            'Prontuário Eletrônico (PEP)',
          ].map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Ionicons name="cloud-outline" size={18} color="#0d6c8b" />
              <Text style={styles.link}>{item}</Text>
            </View>
          ))}
        </View>

        {/* SUPORTE MÉDICO */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="call-outline" size={22} color="#0d6c8b" />
            <Text style={styles.sectionTitle}>Suporte Médico</Text>
          </View>
          <Text style={styles.text}>
            📞 Suporte especializado CarePlus Predict{"\n"}
            Horário: 07h às 19h | Urgências: 24h{"\n"}
            E-mail: suporte.medico@careplus.com.br
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.careplus.com.br')}
            style={styles.websiteButton}
          >
            <Ionicons name="globe-outline" size={18} color="#fff" />
            <Text style={styles.websiteText}>Visitar Website</Text>
          </TouchableOpacity>
        </View>

        {/* EQUIPE DE DESENVOLVIMENTO */}
        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>Equipe de Desenvolvimento</Text>
          <Text style={styles.text}>
            Desenvolvido com ❤️ pela equipe NextGen FIAP{"\n"}
            Design: Equipe NextGen{"\n"}
            Saúde: Especialistas CarePlus
          </Text>
          <Text style={styles.copyright}>
            © 2025 CarePlus Predict. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorAboutScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f8fa', paddingTop: 10 },
  scroll: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  appTitle: { fontSize: 22, fontWeight: '700', color: '#0d6c8b' },
  version: { fontSize: 14, color: '#777', marginTop: 4 },
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0d6c8b', marginLeft: 8 },
  text: { fontSize: 14, color: '#333', lineHeight: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6 },
  itemTitle: { fontWeight: '600', fontSize: 14, color: '#0d6c8b' },
  itemDesc: { fontSize: 13, color: '#555' },
  link: { fontSize: 14, color: '#0d6c8b', marginLeft: 8, fontWeight: '600' },
  websiteButton: {
    backgroundColor: '#0d6c8b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  websiteText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  copyright: { color: '#888', fontSize: 12, marginTop: 6 },
});
