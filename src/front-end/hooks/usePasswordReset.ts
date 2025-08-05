import { useState } from 'react';
import { Alert } from 'react-native';
import httpService from '../services/httpService';
import { useErrorHandling } from './useErrorHandling';

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { executeWithErrorHandling } = useErrorHandling();

  const forgotPassword = async (data: ForgotPasswordData): Promise<boolean> => {
    return await executeWithErrorHandling(
      async () => {
        setIsLoading(true);
        
        const response = await httpService.post('/auth/forgot-password', data, true, true);
        const responseData = response.data as any;
        
        Alert.alert(
          'Solicitação Enviada',
          responseData?.message || 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
          [{ text: 'OK' }]
        );

        // Em desenvolvimento, mostrar o token
        if (responseData?.token && __DEV__) {
          Alert.alert(
            'Token de Desenvolvimento',
            `Token para teste: ${responseData.token}`,
            [{ text: 'Copiar', onPress: () => console.log('Token:', responseData.token) }]
          );
        }

        return true;
      },
      { showToUser: true, loadingState: false }
    ).finally(() => setIsLoading(false)) || false;
  };

  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
    return await executeWithErrorHandling(
      async () => {
        setIsLoading(true);
        
        const response = await httpService.post('/auth/reset-password', data, true, true);
        const responseData = response.data as any;
        
        Alert.alert(
          'Sucesso!',
          responseData?.message || 'Senha redefinida com sucesso!',
          [{ text: 'OK' }]
        );

        return true;
      },
      { showToUser: true, loadingState: false }
    ).finally(() => setIsLoading(false)) || false;
  };

  return {
    forgotPassword,
    resetPassword,
    isLoading,
  };
};
