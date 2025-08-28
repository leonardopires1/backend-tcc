import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';
import FormCadastro from '../types/FormCadastro';

interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  genero: string;
  moradiaId?: number;
  moradiasDono?: {
    id: number;
    nome: string;
    endereco: string;
  }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tokenExpiry: number | null;
}

type AuthAction = 
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string; tokenExpiry: number } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null; refreshToken: string | null; tokenExpiry: number | null } }
  | { type: 'REFRESH_SUCCESS'; payload: { token: string; tokenExpiry: number } };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  signup: (formData: FormCadastro) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshAccessToken: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        isLoading: false,
        isAuthenticated: !!action.payload.token,
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        tokenExpiry: action.payload.tokenExpiry,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  tokenExpiry: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = async () => {
    try {
      const [token, userData, storedRefreshToken, tokenExpiry] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('tokenExpiry')
      ]);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const expiry = tokenExpiry ? parseInt(tokenExpiry) : null;
        
        dispatch({ 
          type: 'RESTORE_TOKEN', 
          payload: { 
            user, 
            token, 
            refreshToken: storedRefreshToken,
            tokenExpiry: expiry
          } 
        });
      } else {
        dispatch({ 
          type: 'RESTORE_TOKEN', 
          payload: { 
            user: null, 
            token: null, 
            refreshToken: null, 
            tokenExpiry: null 
          } 
        });
      }
    } catch (error) {
      console.error('Erro ao restaurar token:', error);
      dispatch({ 
        type: 'RESTORE_TOKEN', 
        payload: { 
          user: null, 
          token: null, 
          refreshToken: null, 
          tokenExpiry: null 
        } 
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: 'LOADING' });

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        senha: password,
      };
      
      console.log('🔐 Tentando fazer login com:', { email: loginData.email, senhaLength: password.length });

      const response = await HttpService.post(API_CONFIG.ENDPOINTS.AUTH.SIGNIN, loginData, false);

      console.log('📡 Resposta do login:', { ok: response.ok, status: response.status, hasData: !!response.data });

      if (response.ok && response.data) {
        const { access_token, refresh_token, user, expires_in } = response.data as { 
          access_token: string; 
          refresh_token?: string;
          user: User; 
          expires_in?: number;
        };
        
        const tokenExpiry = expires_in ? Date.now() + (expires_in * 1000) : Date.now() + (24 * 60 * 60 * 1000); // 24 hours default
        
        await Promise.all([
          AsyncStorage.setItem('userToken', access_token),
          refresh_token && AsyncStorage.setItem('refreshToken', refresh_token),
          AsyncStorage.setItem('userData', JSON.stringify(user)),
          AsyncStorage.setItem('tokenExpiry', tokenExpiry.toString())
        ]);
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user, 
            token: access_token, 
            refreshToken: refresh_token || '', 
            tokenExpiry 
          } 
        });

        console.log('✅ Login realizado com sucesso para:', user.email);
        return { success: true };
      } else {
        dispatch({ type: 'LOGOUT' });
        
        let errorMessage = 'Credenciais inválidas';
        
        // Se a resposta tem uma estrutura de erro de validação
        if (response.error) {
          const error = response.error as any;
          if (error && typeof error === 'object') {
            if (Array.isArray(error.message)) {
              errorMessage = error.message.join(', ');
            } else if (error.message) {
              errorMessage = error.message;
            } else {
              errorMessage = JSON.stringify(error);
            }
          } else {
            errorMessage = String(response.error);
          }
        }
        
        console.log('❌ Erro no login:', errorMessage);
        
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } catch (error: any) {
      dispatch({ type: 'LOGOUT' });
      
      console.log('💥 Exceção no login:', error.message);
      
      return { 
        success: false, 
        message: error.message || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await HttpService.post(API_CONFIG.ENDPOINTS.USERS.BASE, userData, false);

      if (response.ok) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.error || 'Erro ao criar conta' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao criar conta' 
      };
    }
  };

  const signup = async (formData: FormCadastro): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: 'LOADING' });

    try {
      const response = await HttpService.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, formData, false);

      if (response.ok && response.data) {
        console.log('✅ Cadastro realizado com sucesso');
        return { success: true, message: 'Cadastro realizado com sucesso!' };
      } else {
        let errorMessage = 'Erro no cadastro';
        
        if (response.error) {
          const error = response.error as any;
          if (error && typeof error === 'object') {
            if (Array.isArray(error.message)) {
              errorMessage = error.message.join(', ');
            } else if (error.message) {
              errorMessage = error.message;
            }
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
        }

        console.log('❌ Erro no cadastro:', errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('❌ Erro de rede no cadastro:', error);
      return { success: false, message: 'Erro de conexão. Tente novamente.' };
    } finally {
      dispatch({ 
        type: 'RESTORE_TOKEN', 
        payload: { 
          user: null, 
          token: null, 
          refreshToken: null, 
          tokenExpiry: null 
        } 
      });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await clearStoredAuth();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await HttpService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE, userData);

      if (response.ok && response.data) {
        const updatedUser = { ...state.user, ...response.data };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser as User });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.error || 'Erro ao atualizar perfil' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao atualizar perfil' 
      };
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      if (!state.refreshToken) {
        console.log('❌ Nenhum refresh token disponível');
        return false;
      }

      const response = await HttpService.post(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refresh_token: state.refreshToken },
        false
      );

      if (response.ok && response.data) {
        const { access_token, expires_in } = response.data as { 
          access_token: string; 
          expires_in?: number;
        };
        
        const tokenExpiry = expires_in ? Date.now() + (expires_in * 1000) : Date.now() + (24 * 60 * 60 * 1000);
        
        await Promise.all([
          AsyncStorage.setItem('userToken', access_token),
          AsyncStorage.setItem('tokenExpiry', tokenExpiry.toString())
        ]);
        
        dispatch({ 
          type: 'REFRESH_SUCCESS', 
          payload: { token: access_token, tokenExpiry } 
        });

        console.log('✅ Token renovado com sucesso');
        return true;
      } else {
        console.log('❌ Falha ao renovar token');
        await logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      await logout();
      return false;
    }
  };

  const clearStoredAuth = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken', 'tokenExpiry']);
  };

  const refreshUserData = async () => {
    if (!state.user?.email) return;
    
    console.log('🔄 Refreshing user data...');
    try {
      const response = await HttpService.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
      
      if (response.ok && response.data) {
        const updatedUser = response.data as User;
        console.log('✅ User data refreshed:', { 
          email: updatedUser.email, 
          moradiaId: updatedUser.moradiaId 
        });
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } else {
        console.log('❌ Error refreshing user data:', response.error);
      }
    } catch (error) {
      console.error('💥 Exception refreshing user data:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    signup,
    updateProfile,
    refreshAccessToken,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
