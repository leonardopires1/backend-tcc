import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';

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
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction = 
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null } };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshToken: () => Promise<void>;
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
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
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
        isLoading: false,
        isAuthenticated: !!action.payload.token,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
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
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'RESTORE_TOKEN', payload: { user, token } });
      } else {
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
      }
    } catch (error) {
      console.error('Erro ao restaurar token:', error);
      dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
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
        const { access_token, user } = response.data as { access_token: string; user: User };
        
        await AsyncStorage.setItem('userToken', access_token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, token: access_token } 
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

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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

  const refreshToken = async () => {
    try {
      const response = await HttpService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      
      if (response.ok && response.data) {
        const { access_token } = response.data as { access_token: string };
        await AsyncStorage.setItem('userToken', access_token);
        // Não é necessário dispatch aqui, o token será usado automaticamente
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    refreshToken,
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
