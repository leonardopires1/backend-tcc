import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Componente de fallback para quando ocorrer erro
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleReportError = () => {
    Alert.alert(
      "Reportar Erro",
      "Este erro será reportado para melhorarmos o aplicativo.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Reportar", onPress: () => {
          console.error('Error reported by user:', error);
          // Aqui você pode implementar um serviço de logging/crash reporting
        }}
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>😔 Oops! Algo deu errado</Text>
      <Text style={styles.message}>
        Não se preocupe! O aplicativo encontrou um problema, mas você pode continuar usando-o.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={resetErrorBoundary}>
          <Text style={styles.primaryButtonText}>🔄 Continuar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleReportError}>
          <Text style={styles.secondaryButtonText}>📢 Reportar Problema</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.errorDetailsContainer}>
        <Text style={styles.errorDetailsTitle}>Detalhes técnicos:</Text>
        <Text style={styles.errorDetails}>
          {error.name}: {error.message}
        </Text>
      </View>
    </ScrollView>
  );
};

// Função para lidar com erros não capturados
const handleError = (error: Error, errorInfo: any) => {
  console.error('🚨 Error caught by boundary:', error);
  console.error('📍 Error info:', errorInfo);
  
  // Aqui você pode enviar o erro para um serviço de monitoramento
  // como Sentry, Crashlytics, etc.
};

// Função para lidar com reset do erro
const handleReset = (details: any) => {
  console.log('🔄 Error boundary reset:', details);
  // Aqui você pode adicionar lógica para limpar estados ou caches
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.XL,
    minHeight: '100%',
  },
  title: {
    fontSize: FONT_SIZES.XXL || 28,
    fontWeight: 'bold',
    color: COLORS.ERROR,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.XL,
    lineHeight: 24,
    paddingHorizontal: SPACING.MD,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD,
    borderRadius: 12,
    marginBottom: SPACING.MD,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
  },
  errorDetailsContainer: {
    backgroundColor: '#f8f9fa',
    padding: SPACING.MD,
    borderRadius: 8,
    width: '100%',
    marginTop: SPACING.MD,
  },
  errorDetailsTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  errorDetails: {
    fontSize: FONT_SIZES.XS || 12,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});
