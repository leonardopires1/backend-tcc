import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/apiConfig';
import { safeExecute, showUserFriendlyError } from './errorService';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  showErrorToUser?: boolean;
  isRefreshRequest?: boolean; // Flag para evitar loop infinito
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

interface TokenData {
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

class HttpService {
  private baseURL: string;
  private timeout: number;
  private refreshPromise: Promise<boolean> | null = null;

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

  private async getTokenData(): Promise<TokenData> {
    const [token, refreshToken, tokenExpiry] = await Promise.all([
      AsyncStorage.getItem('userToken'),
      AsyncStorage.getItem('refreshToken'),
      AsyncStorage.getItem('tokenExpiry')
    ]);

    return {
      token,
      refreshToken,
      tokenExpiry: tokenExpiry ? parseInt(tokenExpiry) : null
    };
  }

  private async getAuthToken(): Promise<string | null> {
    const { token } = await this.getTokenData();
    return token;
  }

  private async isTokenExpired(): Promise<boolean> {
    const { tokenExpiry } = await this.getTokenData();
    if (!tokenExpiry) return false;
    
    // Consider token expired 5 minutes before actual expiry
    return Date.now() >= (tokenExpiry - 5 * 60 * 1000);
  }

  private async refreshAccessToken(): Promise<boolean> {
    // Se já há uma promise de refresh em andamento, aguardar ela
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const { refreshToken } = await this.getTokenData();
      
      if (!refreshToken) {
        console.log('❌ Nenhum refresh token disponível');
        return false;
      }

      const response = await this.makeRequest<{ access_token: string; expires_in: number }>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        {
          method: 'POST',
          body: { refresh_token: refreshToken },
          requiresAuth: false,
          isRefreshRequest: true
        }
      );

      if (response.ok && response.data) {
        const { access_token, expires_in } = response.data;
        const tokenExpiry = Date.now() + (expires_in * 1000);
        
        await Promise.all([
          AsyncStorage.setItem('userToken', access_token),
          AsyncStorage.setItem('tokenExpiry', tokenExpiry.toString())
        ]);
        
        console.log('✅ Token renovado com sucesso');
        return true;
      } else {
        console.log('❌ Falha ao renovar token');
        await this.clearAuthTokens();
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      await this.clearAuthTokens();
      return false;
    }
  }

  private async clearAuthTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken', 'tokenExpiry']);
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
      showErrorToUser = false,
      isRefreshRequest = false
    } = options;

    const fallbackResponse: ApiResponse<T> = {
      status: 0,
      ok: false,
      error: 'Erro de conectividade. Verifique sua conexão e tente novamente.',
    };

    const result = await safeExecute(async () => {
      // Se requer autenticação e não é um refresh request, verificar se token precisa ser renovado
      if (requiresAuth && !isRefreshRequest) {
        const expired = await this.isTokenExpired();
        if (expired) {
          console.log('🔄 Token expirado, tentando renovar...');
          const refreshed = await this.refreshAccessToken();
          if (!refreshed) {
            return {
              status: 401,
              ok: false,
              error: 'Sessão expirada. Por favor, faça login novamente.',
            };
          }
        }
      }

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

        // Se recebeu 401 (não autorizado) e não é um refresh request, tentar renovar token
        if (response.status === 401 && requiresAuth && !isRefreshRequest) {
          console.log('🔄 Token inválido (401), tentando renovar...');
          const refreshed = await this.refreshAccessToken();
          
          if (refreshed) {
            // Tentar a requisição novamente com o novo token
            console.log('🔄 Reenviando requisição com novo token...');
            return this.makeRequest<T>(endpoint, { ...options, isRefreshRequest: true });
          } else {
            return {
              status: 401,
              ok: false,
              error: 'Sessão expirada. Por favor, faça login novamente.',
            };
          }
        }

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
