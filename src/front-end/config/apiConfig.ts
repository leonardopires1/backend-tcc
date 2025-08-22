const API_CONFIG = {
  BASE_URL: "http://192.168.217.2:3000",

  ENDPOINTS: {
    AUTH: {
      SIGNIN: "/auth/signin",
      SIGNUP: "/auth/signup",
      REFRESH: "/auth/refresh",
      RESET_PASSWORD: "/auth/reset-password",
    },
    USERS: {
      BASE: "/users",
      PROFILE: "/users/profile",
      UPDATE: "/users/update",
    },
    MORADIAS: {
      BASE: "/moradias",
      BY_ID: (id: number) => `/moradias/${id}`,
      BY_USER: "/moradias/user",
      BY_DONO: (donoId: number) => `/moradias/dono/${donoId}`,
    },
    COMODIDADES: {
      BASE: "/comodidades-moradia",
      BY_MORADIA: (id: number) => `/comodidades-moradia/comodidades/${id}`,
      DELETE: (id: number) => `/comodidades-moradia/comodidades/${id}`,
    },
    REGRAS: {
      BASE: "/regras-moradia",
      GET_ALL: "/regras-moradia/getAll",
      GET_UNIQUE: (id: number) => `/regras-moradia/getUnique/${id}`,
      REGISTER: (idMoradia: number, idRegra: number) =>
        `/regras-moradia/register/${idMoradia}/${idRegra}`,
      BY_MORADIA: (idMoradia: number) => `/regras-moradia/moradia/${idMoradia}`,
      UNLINK: (idMoradia: number, idRegra: number) =>
        `/regras-moradia/register/${idMoradia}/${idRegra}`,
    },
  },

  TIMEOUT: 15000, // 15 segundos (aumentado para evitar timeouts prematuros)
};

export default API_CONFIG;
