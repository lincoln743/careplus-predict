import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = useCallback((sessionData) => {
    setUser({
      userId: sessionData.userId,
      userType: sessionData.userType,
      token: sessionData.token,
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token: user?.token || null,
    userId: user?.userId || null,
    userType: user?.userType || null,
    isAuthenticated: !!user,
    isDoctor: user?.userType === 'doctor',
    isPatient: user?.userType === 'patient',
    signIn,
    signOut,
  }), [user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
