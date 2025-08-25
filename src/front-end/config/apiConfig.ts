const API_CONFIG = {
  BASE_URL: "https://eq3.ini3b.projetoscti.com.br",

  ENDPOINTS: {
    AUTH: {
      SIGNIN: "/auth/signin",
      SIGNUP: "/auth/signup",
      REFRESH: "/auth/refresh",
      RESET_PASSWORD: "/auth/reset-password",
    },
    USERS: {
      BASE: "/users",
      PROFILE: "/auth/profile",
      UPDATE: "/users/update",
      BY_CPF: (cpf: string) => `/users/cpf/${cpf}`,
    },
    MORADIAS: {
      BASE: "/moradias",
      BY_ID: (id: number) => `/moradias/${id}`,
      BY_USER: "/moradias/user",
      BY_DONO: (donoId: number) => `/moradias/dono/${donoId}`,
      ADD_MEMBER: (moradiaId: number, usuarioId: number) => `/moradias/${moradiaId}/adicionar-membro/${usuarioId}`,
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

  TIMEOUT: 150000, // 150 segundos (aumentado para evitar timeouts prematuros)
};

export default API_CONFIG;
