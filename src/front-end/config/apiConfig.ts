const API_CONFIG = {
  BASE_URL: 'https://backend-tcc-ezhj.onrender.com',

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
  
  TIMEOUT: 15000, // 15 segundos (aumentado para evitar timeouts prematuros)
};

export default API_CONFIG;
