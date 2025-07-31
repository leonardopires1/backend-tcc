import React from 'react';
import { Alert, View, Text } from 'react-native';

// Configuração global para capturar erros não tratados
export const setupGlobalErrorHandling = () => {
  // Captura erros JavaScript não tratados
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    // Log para monitoramento (você pode enviar para serviços como Sentry)
    logError('Console Error', args);
  };

  // Captura erros de Promise rejeitadas não tratadas
  const handleUnhandledRejection = (event: any) => {
    console.warn('Unhandled Promise Rejection:', event.reason);
    logError('Unhandled Promise Rejection', event.reason);
    // Previne que o app feche
    return true;
  };

  // Para React Native, configurar tratamento global de erros
  if ((global as any).ErrorUtils) {
    const originalHandler = (global as any).ErrorUtils.getGlobalHandler();
    (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
      console.error('Global Error Handler:', error, 'isFatal:', isFatal);
      logError('Global Error', error);
      
      // Chama o handler original se não for fatal
      if (!isFatal && originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
};

// Função para logar erros
const logError = (type: string, error: any) => {
  const errorInfo = {
    type,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  console.log('📊 Error logged:', errorInfo);
  
  // Aqui você pode enviar para serviços de monitoramento
  // sendToErrorReporting(errorInfo);
};

// Função para mostrar erro amigável ao usuário
export const showUserFriendlyError = (message?: string) => {
  const friendlyMessage = message || 
    'Ops! Algo deu errado, mas não se preocupe. O aplicativo continuará funcionando normalmente.';
  
  Alert.alert(
    '😊 Tudo sob controle!',
    friendlyMessage,
    [
      { 
        text: 'OK', 
        style: 'default',
        onPress: () => console.log('User acknowledged error') 
      }
    ],
    { cancelable: true }
  );
};

// Wrapper para funções que podem dar erro
export const safeExecute = async <T>(
  fn: () => Promise<T> | T,
  fallback?: T,
  showError = false
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error: any) {
    // Tratamento específico para diferentes tipos de erro
    let errorMessage = 'Erro desconhecido';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Requisição cancelada (timeout)';
      console.warn('🚫 Request aborted:', error.message);
    } else if (error.message?.includes('Network request failed')) {
      errorMessage = 'Erro de conectividade';
      console.warn('🌐 Network error:', error.message);
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Erro de formato de dados';
      console.warn('📄 JSON parsing error:', error.message);
    } else {
      console.warn('⚠️ Safe execute caught error:', error.message || error);
    }
    
    logError('Safe Execute', { 
      error: error.message || error.toString(),
      type: error.name || 'Unknown',
      stack: error.stack 
    });
    
    if (showError) {
      showUserFriendlyError(errorMessage);
    }
    
    return fallback;
  }
};

// HOC para proteger componentes
export const withErrorProtection = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error('Component error caught:', error);
      logError('Component Error', error);
      
      // Retorna uma UI de fallback simples para React Native
      return React.createElement(
        View,
        { 
          style: { 
            padding: 20, 
            alignItems: 'center', 
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            margin: 10
          }
        },
        React.createElement(
          Text,
          { style: { textAlign: 'center', fontSize: 16 } },
          '😅 Este componente encontrou um problema, mas o app continua funcionando!'
        )
      );
    }
  };
};

export default {
  setupGlobalErrorHandling,
  showUserFriendlyError,
  safeExecute,
  withErrorProtection,
};
