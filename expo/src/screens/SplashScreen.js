import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]),
      Animated.timing(textAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim, textAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Image
          source={require('../../assets/careplus-logo-white.png')}
          style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.text, { opacity: textAnim }]}>
          Cuidar da saúde é prever o futuro
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0d6c8b' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d6c8b' },
  logo: { width: 180, height: 180, marginBottom: 20 },
  text: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
});
