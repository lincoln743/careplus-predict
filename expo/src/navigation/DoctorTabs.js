import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DoctorDashboard from '../screens/DoctorDashboard';
import DoctorPatientsScreen from '../screens/DoctorPatientsScreen';
import DoctorMetricsScreen from '../screens/DoctorMetricsScreen';
import DoctorSettingsScreen from '../screens/DoctorSettingsScreen';
import DoctorAboutScreen from '../screens/DoctorAboutScreen';

const Tab = createBottomTabNavigator();

export default function DoctorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0d6c8b',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { height: 60, paddingBottom: 5 },
        tabBarIcon: ({ color }) => {
          let iconName;

          if (route.name === 'Inicio') iconName = 'home-outline';
          else if (route.name === 'Pacientes') iconName = 'people-outline';
          else if (route.name === 'Metricas') iconName = 'pulse-outline';
          else if (route.name === 'Config') iconName = 'settings-outline';
          else if (route.name === 'Sobre') iconName = 'information-circle-outline';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={DoctorDashboard} />
      <Tab.Screen name="Pacientes" component={DoctorPatientsScreen} />
      <Tab.Screen name="Metricas" component={DoctorMetricsScreen} />
      <Tab.Screen name="Config" component={DoctorSettingsScreen} />
      <Tab.Screen name="Sobre" component={DoctorAboutScreen} />
    </Tab.Navigator>
  );
}
