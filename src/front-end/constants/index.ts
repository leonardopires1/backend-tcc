// Cores do tema da aplicação
export const COLORS = {
  PRIMARY: '#0073FF',
  PRIMARY_LIGHT: '#E3F2FD',
  SECONDARY: '#FF6B6B',
  SUCCESS: '#4CAF50',
  WARNING: '#FFC107',
  ERROR: '#F44336',
  INFO: '#2196F3',
  
  // Cores neutras
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F8F9FA',
  GRAY: '#6C757D',
  GRAY_DARK: '#343A40',
  
  // Texto
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  TEXT_LIGHT: '#ADB5BD',
  
  // Bordas
  BORDER_LIGHT: '#E9ECEF',
  BORDER: '#DEE2E6',
};

// Tamanhos de fonte
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 28,
  TITLE: 32,
};

// Espaçamentos
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

// Raios de borda
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  XXL: 20,
  ROUND: 50,
};

// Sombras
export const SHADOWS = {
  LIGHT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  HEAVY: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Configurações da aplicação
export const APP_CONFIG = {
  NAME: 'RoomMate App',
  VERSION: '1.0.0',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
  
  // Limites
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_MORADIA: 10,
  
  // Validações
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 500,
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  NETWORK: 'Erro de conectividade. Verifique sua conexão com a internet.',
  TIMEOUT: 'Tempo limite excedido. Tente novamente.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  UNKNOWN: 'Erro desconhecido. Tente novamente.',
  
  // Validações
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  INVALID_EMAIL: 'Email inválido.',
  PASSWORD_TOO_SHORT: `A senha deve ter pelo menos ${APP_CONFIG.MIN_PASSWORD_LENGTH} caracteres.`,
  PASSWORDS_NOT_MATCH: 'As senhas não coincidem.',
};
