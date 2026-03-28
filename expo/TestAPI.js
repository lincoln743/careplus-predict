import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function TestAPI() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://192.168.0.200:3333/ping')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => setData({ error: err.message }));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Teste da API</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
}
