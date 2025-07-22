import { Alert, AlertButton } from 'react-native';

interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: AlertButton[];
}

export class NotificationService {
  static showSuccess(message: string, title = 'Sucesso') {
    this.show({
      title,
      message,
      type: 'success',
    });
  }

  static showError(message: string, title = 'Erro') {
    this.show({
      title,
      message,
      type: 'error',
    });
  }

  static showWarning(message: string, title = 'Atenção') {
    this.show({
      title,
      message,
      type: 'warning',
    });
  }

  static showInfo(message: string, title = 'Informação') {
    this.show({
      title,
      message,
      type: 'info',
    });
  }

  static showConfirm(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    title = 'Confirmação'
  ) {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: onConfirm,
        },
      ]
    );
  }

  private static show({ title, message, buttons }: ToastOptions) {
    Alert.alert(
      title || 'Aviso',
      message,
      buttons || [{ text: 'OK' }]
    );
  }
}
