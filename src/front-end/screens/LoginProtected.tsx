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
import { AppErrorBoundary } from "../components/common/ErrorBoundary";
import { useErrorHandling } from "../hooks/useErrorHandling";
import { withErrorProtection, showUserFriendlyError } from "../services/errorService";

// Componente protegido contra erros
const LoginContent = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  
  const { login } = useAuth();
  const { error, isLoading, clearError, executeWithErrorHandling } = useErrorHandling();

  const handleLogin = async () => {
    // Limpeza de erro anterior
    clearError();

    // Validação básica com tratamento de erro amigável
    if (!email.trim() || !senha.trim()) {
      showUserFriendlyError("Por favor, preencha todos os campos para continuar.");
      return;
    }

    // Validação de email com tratamento amigável
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showUserFriendlyError("Por favor, insira um email válido para continuar.");
      return;
    }

    // Executa login com proteção contra erros
    await executeWithErrorHandling(
      async () => {
        const result = await login(email, senha);
        
        if (result.success) {
          Alert.alert("✅ Sucesso", "Login realizado com sucesso!");
          // A navegação será automática devido ao contexto de autenticação
        } else {
          showUserFriendlyError(
            result.message || "Não foi possível fazer login. Verifique suas credenciais e tente novamente."
          );
        }
        
        return result;
      },
      {
        showToUser: true,
        loadingState: true,
        fallback: { success: false, message: "Erro de conectividade" }
      }
    );
  };

  const handleForgotPassword = async () => {
    await executeWithErrorHandling(
      async () => {
        Alert.alert(
          "🔄 Recuperar Senha",
          "Em breve implementaremos a recuperação de senha. Por enquanto, entre em contato com o suporte.",
          [{ text: "OK" }]
        );
      },
      { showToUser: true }
    );
  };

  const handleGoToRegister = async () => {
    await executeWithErrorHandling(
      async () => {
        navigation.navigate("Cadastro");
      },
      { showToUser: true }
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {isLoading && <Loading overlay text="Fazendo login..." />}
      
      <View style={styles.card}>
        <Text style={styles.welcome}>Bem-Vindo</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>ℹ️ {error}</Text>
            <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
              <Text style={styles.clearErrorText}>Dispensar</Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!isLoading}
        />

        <View style={styles.row}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={manterConectado}
              onValueChange={setManterConectado}
              color={manterConectado ? "#0073FF" : undefined}
              disabled={isLoading}
            />
            <Text style={styles.checkboxLabel}>Continuar conectado</Text>
          </View>

          <TouchableOpacity 
            disabled={isLoading}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>Esqueceu a senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta? </Text>
          <TouchableOpacity 
            onPress={handleGoToRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Exporta o componente protegido
const Login = withErrorProtection(LoginContent);

export default function ProtectedLogin({ navigation }: { navigation: any }) {
  return (
    <AppErrorBoundary>
      <Login navigation={navigation} />
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#856404",
    fontSize: 14,
    flex: 1,
  },
  clearErrorButton: {
    marginLeft: 8,
  },
  clearErrorText: {
    color: "#0073FF",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 14,
    color: "#0073FF",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#0073FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerLink: {
    fontSize: 14,
    color: "#0073FF",
    fontWeight: "600",
  },
});
