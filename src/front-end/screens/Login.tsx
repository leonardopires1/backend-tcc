import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Checkbox from "expo-checkbox";
import requisitaLogin from "../api/Login";

export default function Login({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);

  return (
    <View style={styles.container}>
      {/* Card de login */}
      <View style={styles.card}>
        <Text style={styles.welcome}>Bem-Vindo</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <View style={styles.row}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={manterConectado}
              onValueChange={setManterConectado}
              color={manterConectado ? "#0073FF" : undefined}
            />
            <Text style={styles.checkboxLabel}>Continuar conectado</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Esqueceu a senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => requisitaLogin(email, senha, manterConectado, navigation)}
        >
          <Text style={styles.buttonText}>entrar</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Nao tem conta?{" "}
          
            <Text onPress={() => navigation.navigate("Cadastro")} style={styles.forgotText}>crie sua conta aqui</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0073FF",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    resizeMode: "center",
    width: 300,
    marginBottom: 10,
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    minHeight: 400,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.5, // sombra mais visível
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 8, // aumenta a sombra no Android
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0073FF",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: "black",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 6,
    fontSize: 14,
  },
  forgotText: {
    fontSize: 13,
    color: "#0073FF",
    textDecorationLine: "none",
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#0073FF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerText: {
    fontSize: 13,
    textAlign: "center",
  },
  link: {
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
