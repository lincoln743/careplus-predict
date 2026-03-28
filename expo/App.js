import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';

// Tabs do paciente e do médico
import PatientTabs from './src/navigation/PatientTabs';
import DoctorTabs from './src/navigation/DoctorTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* Rota correta após o login */}
            <Stack.Screen name="PatientTabs" component={PatientTabs} />
            <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
