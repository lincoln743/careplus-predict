import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const CarePlusLogo = require('../../assets/images/careplus-logo.png');
  const { signIn } = useAuth();

  const [isDoctor, setIsDoctor] = useState(false);
  const [email, setEmail] = useState('paciente@careplus.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const result = await loginUser(email, password);
      console.log('LOGIN RESULT:', result);

      if (!result?.ok) {
        Alert.alert('Erro', 'Usuário ou senha inválidos');
        return;
      }

      const userId = result.userId;
      const userType = result.userType;
      const token = result.token;

      if (!userId || !userType) {
        Alert.alert('Erro', 'Backend não retornou userId/type');
        return;
      }

      signIn({
        userId: String(userId),
        userType,
        token,
      });
    } catch (error) {
      console.log('LOGIN ERROR:', error);
      Alert.alert('Erro', 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#e6f2f4', '#ffffff']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e6f2f4" />
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <Image source={CarePlusLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Bem-vindo ao CarePlus Predict</Text>

        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[styles.switchButton, !isDoctor && styles.activeSwitch]}
            onPress={() => {
              setIsDoctor(false);
              setEmail('paciente@careplus.com');
              setPassword('123456');
            }}
          >
            <Text style={[styles.switchText, !isDoctor && styles.activeSwitchText]}>
              Paciente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchButton, isDoctor && styles.activeSwitch]}
            onPress={() => {
              setIsDoctor(true);
              setEmail('medico@careplus.com');
              setPassword('123456');
            }}
          >
            <Text style={[styles.switchText, isDoctor && styles.activeSwitchText]}>
              Médico
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>
              {isDoctor ? 'Entrar como Médico' : 'Entrar como Paciente'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#0d6c8b',
    marginBottom: 25,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0d6c8b',
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeSwitch: {
    backgroundColor: '#0d6c8b',
  },
  switchText: {
    color: '#0d6c8b',
    fontWeight: '500',
  },
  activeSwitchText: { color: '#fff' },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#d9e5e8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d6c8b',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  forgotContainer: { marginTop: 12 },
  forgotText: {
    color: '#0d6c8b',
    fontSize: 13,
  },
});

export default LoginScreen;
