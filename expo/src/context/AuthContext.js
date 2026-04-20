import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { saveSession, loadSession, clearSession } from '../services/authStorage';
import { registerUnauthorizedHandler } from '../services/authEvents';

export const AuthContext = createContext();

const DEMO_MODE = false; // true = sempre volta pro login | false = restaura sessão

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const signOut = useCallback(async () => {
    setUser(null);

    try {
      await clearSession();
    } catch (_) {}
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(signOut);
  }, [signOut]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (DEMO_MODE) {
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const session = await loadSession();
        setUser(session);
      } catch (_) {
        await clearSession();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async ({ userId, userType, token }) => {
    const newUser = {
      id: String(userId),
      type: userType,
      token,
    };

    setUser(newUser);

    try {
      if (!DEMO_MODE) {
        await saveSession(newUser);
      }
    } catch (_) {}
  };

  const contextValue = {
    user,
    userId: user?.id || null,
    userType: user?.type || null,
    token: user?.token || null,
    authLoading,
    signIn,
    signOut,
    DEMO_MODE,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
