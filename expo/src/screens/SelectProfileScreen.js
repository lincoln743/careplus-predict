import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function SelectProfileScreen() {
  const { signInDemo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Button title="Entrar como Paciente" onPress={() => signInDemo("patient")} />
      <Button title="Entrar como Médico" onPress={() => signInDemo("doctor")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    padding: 20,
  },
});
