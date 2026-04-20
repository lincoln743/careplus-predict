import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SobreMedicoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CarePlus Predict</Text>
        <Text style={styles.version}>Versão 1.0.0</Text>

        {/* Missão */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart-outline" size={22} color="#0d6c8b" style={styles.icon} />
            <Text style={styles.cardTitle}>Nossa Missão</Text>
          </View>
          <Text style={styles.cardText}>
            O CarePlus Predict Médico utiliza inteligência preditiva para transformar dados clínicos em ações preventivas,
            promovendo saúde proativa e suporte avançado para decisões médicas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f9fa' },
  container: { padding: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0d6c8b', marginTop: 8 },
  version: { color: '#666', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { marginRight: 6 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#0d6c8b' },
  cardText: { fontSize: 15, color: '#333', lineHeight: 22 },
});
