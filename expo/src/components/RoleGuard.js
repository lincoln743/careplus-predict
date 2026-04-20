import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowedRole, children }) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user || user.userType !== allowedRole) {
      signOut();
    }
  }, [user, allowedRole, signOut]);

  if (!user || user.userType !== allowedRole) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d6c8b" />
      </View>
    );
  }

  return children;
};

export default RoleGuard;
