const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://192.168.0.22:3000'  // IP local para desenvolvimento
    : 'https://your-production-api.com', // URL de produção
  
  ENDPOINTS: {
    AUTH: {
      SIGNIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      REFRESH: '/auth/refresh',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
      BASE: '/users',
      PROFILE: '/users/profile',
      UPDATE: '/users/update',
    },
    MORADIAS: {
      BASE: '/moradias',
      BY_ID: (id: number) => `/moradias/${id}`,
      BY_USER: '/moradias/user',
    },
    COMODIDADES: {
      BASE: '/comodidades-moradia',
    },
    REGRAS: {
      BASE: '/regra-moradia',
    },
  },
  
  TIMEOUT: 10000, // 10 segundos
};

export default API_CONFIG;
