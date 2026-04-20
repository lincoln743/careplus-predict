import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./src/context/AuthContext";

import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PatientTabs from "./src/navigation/PatientTabs";
import DoctorTabs from "./src/navigation/DoctorTabs";

export default function AppNavigator() {
  const { user, authLoading, signOut } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const validateUserType = async () => {
      if (!user) return;

      const validTypes = ["patient", "doctor"];

      if (!validTypes.includes(user.type)) {
        console.log("ROUTE GUARD: tipo de usuário inválido, encerrando sessão");
        await signOut();
      }
    };

    validateUserType();
  }, [user, signOut]);

  if (showSplash || authLoading) {
    return <SplashScreen />;
  }

  if (!user || !user.token || !user.type) {
    return <LoginScreen />;
  }

  if (user.type === "patient") {
    return <PatientTabs />;
  }

  if (user.type === "doctor") {
    return <DoctorTabs />;
  }

  return <LoginScreen />;
}
