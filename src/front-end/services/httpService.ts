import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/apiConfig';
import { safeExecute, showUserFriendlyError } from './errorService';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  showErrorToUser?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

class HttpService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Função utilitária para extrair mensagem de erro
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      return error.message || error.error || JSON.stringify(error);
    }
    
    return 'Erro desconhecido';
  }

  private async getAuthToken(): Promise<string | null> {
    const token = await safeExecute(async () => {
      return await AsyncStorage.getItem('userToken');
    }, null, false);
    return token || null;
  }

  // Verifica se o servidor está acessível
  private async checkConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s para teste de conectividade
      
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
      showErrorToUser = false
    } = options;

    const fallbackResponse: ApiResponse<T> = {
      status: 0,
      ok: false,
      error: 'Erro de conectividade. Verifique sua conexão e tente novamente.',
    };

    const result = await safeExecute(async () => {
      const url = `${this.baseURL}${endpoint}`;
      
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (requiresAuth) {
        const token = await this.getAuthToken();
        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }
      }

      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
        ...(body && { body: JSON.stringify(body) }),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Request timeout after ${this.timeout}ms for ${url}`);
        controller.abort();
      }, this.timeout);

      try {
        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let data: T | undefined;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        }

        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          ok: response.ok,
          error: !response.ok ? this.extractErrorMessage(data) : undefined,
        };

        // Se houve erro e deve mostrar ao usuário
        if (!response.ok && showErrorToUser) {
          showUserFriendlyError(this.extractErrorMessage(apiResponse.error));
        }

        return apiResponse;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Tratamento específico para AbortError
        if (fetchError.name === 'AbortError') {
          console.log(`🚫 Request aborted for ${url}`);
          throw new Error('Tempo limite da requisição excedido. Tente novamente.');
        }
        
        // Re-throw outros erros para serem tratados pelo safeExecute
        throw fetchError;
      }
    }, fallbackResponse, showErrorToUser);

    return result || fallbackResponse;
  }

  // Métodos públicos
  async get<T>(endpoint: string, requiresAuth = true, showErrorToUser = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', requiresAuth, showErrorToUser });
  }

  async post<T>(endpoint: string, body?: any, requiresAuth = true, showErrorToUser = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body, requiresAuth, showErrorToUser });
  }

  async put<T>(endpoint: string, body?: any, requiresAuth = true, showErrorToUser = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body, requiresAuth, showErrorToUser });
  }

  async delete<T>(endpoint: string, requiresAuth = true, showErrorToUser = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', requiresAuth, showErrorToUser });
  }

  async patch<T>(endpoint: string, body?: any, requiresAuth = true, showErrorToUser = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body, requiresAuth, showErrorToUser });
  }
}

export default new HttpService();
