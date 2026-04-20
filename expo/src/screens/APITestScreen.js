import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function APITestScreen() {
  const [data, setData] = useState("carregando...");

  useEffect(() => {
    fetch("https://careplus-predict.onrender.com/ping")
      .then(res => res.json())
      .then(json => setData(JSON.stringify(json, null, 2)))
      .catch(err => setData("Erro: " + err.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste da API</Text>
      <Text style={styles.result}>{data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  result: { fontSize: 16, fontFamily: "monospace" }
});
