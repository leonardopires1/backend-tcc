import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useAuth } from "../contexts/AuthContext";
import { Loading } from "../components/common/Loading";

export default function Login({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um email válido.");
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email, senha);
      
      if (result.success) {
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        // A navegação será automática devido ao contexto de autenticação
      } else {
        Alert.alert("Erro", result.message || "Falha no login");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && <Loading overlay text="Fazendo login..." />}
      
      <View style={styles.card}>
        <Text style={styles.welcome}>Bem-Vindo</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!loading}
        />

        <View style={styles.row}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={manterConectado}
              onValueChange={setManterConectado}
              color={manterConectado ? "#0073FF" : undefined}
              disabled={loading}
            />
            <Text style={styles.checkboxLabel}>Continuar conectado</Text>
          </View>

          <TouchableOpacity disabled={loading}>
            <Text style={styles.forgotText}>Esqueceu a senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Não tem conta?{" "}
          <Text 
            onPress={() => !loading && navigation.navigate("Cadastro")} 
            style={[styles.forgotText, loading && styles.linkDisabled]}
          >
            crie sua conta aqui
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0073FF",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    minHeight: 400,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F1F1F1",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  forgotText: {
    color: "#0073FF",
    fontSize: 14,
    fontWeight: "500",
  },
  linkDisabled: {
    color: "#999",
  },
  button: {
    backgroundColor: "#0073FF",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
