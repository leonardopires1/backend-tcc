import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppErrorBoundary } from '../components/common/ErrorBoundary';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { withErrorProtection, showUserFriendlyError, safeExecute } from '../services/errorService';
import httpService from '../services/httpService';

// Componente de teste para demonstrar diferentes tipos de erro
const ErrorTestContent = () => {
  const [counter, setCounter] = useState(0);
  const { error, isLoading, clearError, executeWithErrorHandling } = useErrorHandling();

  // Teste 1: Erro de renderização (será capturado pelo ErrorBoundary)
  const triggerRenderError = () => {
    if (counter > 5) {
      throw new Error('Erro de renderização intencional!');
    }
  };

  // Teste 2: Erro em função assíncrona
  const testAsyncError = async () => {
    await executeWithErrorHandling(
      async () => {
        throw new Error('Erro assíncrono de teste');
      },
      { showToUser: true, loadingState: true }
    );
  };

  // Teste 3: Erro de API
  const testApiError = async () => {
    await executeWithErrorHandling(
      async () => {
        const result = await httpService.get('/api/endpoint-inexistente', true, true);
        console.log('Resultado:', result);
      },
      { showToUser: true, loadingState: true }
    );
  };

  // Teste 4: Erro com safeExecute
  const testSafeExecute = async () => {
    const resultado = await safeExecute(
      async () => {
        throw new Error('Erro no safeExecute');
      },
      'Valor padrão',
      true
    );
    Alert.alert('Resultado', `Retornou: ${resultado}`);
  };

  // Teste 5: Erro personalizado
  const testCustomError = () => {
    showUserFriendlyError('Esta é uma mensagem de erro personalizada e amigável!');
  };

  // Executa o teste de renderização
  triggerRenderError();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Teste do Sistema de Erro</Text>
      <Text style={styles.subtitle}>
        Este é um ambiente de teste para demonstrar que o app nunca fecha com erros!
      </Text>

      <Text style={styles.counter}>Contador: {counter}</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCounter(counter + 1)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {counter > 5 ? '💥 Incrementar (Causará Erro)' : '✅ Incrementar Contador'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.errorButton]} 
          onPress={testAsyncError}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Testar Erro Async</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.errorButton]} 
          onPress={testApiError}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>📡 Testar Erro de API</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.errorButton]} 
          onPress={testSafeExecute}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🛡️ Testar SafeExecute</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={testCustomError}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>💬 Erro Personalizado</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={() => setCounter(0)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Resetar Contador</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Processando...</Text>
        </View>
      )}

      <Text style={styles.info}>
        💡 Dica: Mesmo que algum erro ocorra, o aplicativo continuará funcionando normalmente!
      </Text>
    </View>
  );
};

// Exporta componente protegido
const ErrorTestScreen = withErrorProtection(ErrorTestContent);

export default function ErrorTestScreenWithBoundary() {
  return (
    <AppErrorBoundary>
      <ErrorTestScreen />
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  counter: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    color: '#1976d2',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#ff9800',
  },
  warningButton: {
    backgroundColor: '#9c27b0',
  },
  resetButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ef6c00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#4caf50',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
