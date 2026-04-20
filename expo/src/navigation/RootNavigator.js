import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import PatientTabs from './PatientTabs';
import DoctorTabs from './DoctorTabs';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';

const Stack = createNativeStackNavigator();

const PatientArea = () => (
  <RoleGuard allowedRole="patient">
    <PatientTabs />
  </RoleGuard>
);

const DoctorArea = () => (
  <RoleGuard allowedRole="doctor">
    <DoctorTabs />
  </RoleGuard>
);

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : user.userType === 'doctor' ? (
          <Stack.Screen name="DoctorTabs" component={DoctorArea} />
        ) : (
          <Stack.Screen name="PatientTabs" component={PatientArea} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
