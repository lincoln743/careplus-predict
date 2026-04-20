import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import HealthDataScreen from '../screens/HealthDataScreen';
import MetricsScreen from '../screens/MetricsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SobreMedicoScreen from '../screens/SobreMedicoScreen';

const Tab = createBottomTabNavigator();

export default function PatientTabs({ route }) {
  const userId = route?.params?.userId || null;

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
          else if (route.name === 'MeusDados') iconName = 'person-circle-outline';
          else if (route.name === 'Metricas') iconName = 'bar-chart-outline';
          else if (route.name === 'Config') iconName = 'settings-outline';
          else if (route.name === 'Sobre') iconName = 'information-circle-outline';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >

      <Tab.Screen name="Inicio">
        {() => <DashboardScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen name="MeusDados">
        {() => <HealthDataScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen name="Metricas">
        {() => <MetricsScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen name="Config">
        {() => <SettingsScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen name="Sobre">
        {() => <SobreMedicoScreen userId={userId} />}
      </Tab.Screen>

    </Tab.Navigator>
  );
}
