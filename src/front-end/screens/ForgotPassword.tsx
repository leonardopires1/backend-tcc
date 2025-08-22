import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { AppErrorBoundary } from '../components/common/ErrorBoundary';
import { withErrorProtection } from '../services/errorService';
import { Loading } from '../components/common/Loading';

interface ForgotPasswordProps {
  navigation?: any;
}

export const ForgotPasswordContent: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { forgotPassword, resetPassword, isLoading } = usePasswordReset();

  // Função simples de validação de email
  const validateEmailFormat = (email: string): string | null => {
    if (!email) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Digite um email válido';
    return null;
  };

  const handleForgotPassword = async () => {
    // Validar email
    const emailError = validateEmailFormat(email);
    if (emailError) {
      Alert.alert('Email Inválido', emailError);
      return;
    }

    const success = await forgotPassword({ email });
    if (success) {
      setStep('token');
    }
  };

  const handleResetPassword = async () => {
    // Validações
    if (!token.trim()) {
      Alert.alert('Erro', 'Por favor, insira o token de recuperação');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      Alert.alert('Erro', 'A nova senha e confirmação não coincidem');
      return;
    }

    const success = await resetPassword({
      token,
      novaSenha,
      confirmarNovaSenha,
    });

    if (success) {
      // Voltar para a tela de login
      Alert.alert(
        'Sucesso!',
        'Senha redefinida com sucesso! Você pode fazer login com sua nova senha.',
        [
          {
            text: 'Ir para Login',
            onPress: () => navigation?.navigate('Login'),
          },
        ]
      );
    }
  };

  const goToLogin = () => {
    navigation?.navigate('Login');
  };

  if (isLoading) {
    return <Loading text="Processando solicitação..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.unifiedBackBtn} onPress={() => navigation?.goBack()}>
            <Text style={styles.unifiedBackIcon}>‹</Text>
            <Text style={styles.unifiedBackText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 'email' ? '🔐 Esqueceu a Senha?' : '🔑 Redefinir Senha'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'Digite seu email para receber instruções de recuperação'
              : 'Digite o token recebido e sua nova senha'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'email' ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    validateEmailFormat(email) && styles.inputError,
                  ]}
                  placeholder="seu@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {validateEmailFormat(email) && (
                  <Text style={styles.errorText}>
                    {validateEmailFormat(email)}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  Enviar Instruções
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Token de Recuperação</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o token recebido"
                  placeholderTextColor="#999"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.helpText}>
                  Verifique seu email ou use o token exibido no desenvolvimento
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nova Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nova senha (mínimo 6 caracteres)"
                    placeholderTextColor="#999"
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Nova Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirme a nova senha"
                    placeholderTextColor="#999"
                    value={confirmarNovaSenha}
                    onChangeText={setConfirmarNovaSenha}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeText}>
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  Redefinir Senha
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setStep('email')}
              >
                <Text style={styles.secondaryButtonText}>
                  Voltar ao Email
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.linkText}>
              Lembrou da senha? <Text style={styles.linkBold}>Fazer Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ForgotPasswordScreen = withErrorProtection(ForgotPasswordContent);

export default function ForgotPasswordScreenWithBoundary(props: ForgotPasswordProps) {
  return (
    <AppErrorBoundary>
      <ForgotPasswordScreen {...props} />
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  unifiedBackBtn: {
    position: 'absolute',
    left: 0,
    top: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbeafe'
  },
  unifiedBackIcon: { color: '#2563eb', fontSize: 18, fontWeight: '600' },
  unifiedBackText: { color: '#2563eb', fontSize: 14, fontWeight: '600', marginLeft: 4 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#0073FF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0073FF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#0073FF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  linkBold: {
    fontWeight: 'bold',
    color: '#0073FF',
  },
});
