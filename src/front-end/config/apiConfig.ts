const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,

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
      UPLOAD_AVATAR: (id: number) => `/users/upload-avatar/${id}`,
      GET_AVATAR: (id: number) => `/users/${id}/avatar`,
    },
    MORADIAS: {
      BASE: "/moradias",
      BY_ID: (id: number) => `/moradias/${id}`,
      BY_USER: "/moradias/user",
      BY_DONO: (donoId: number) => `/moradias/dono/${donoId}`,
      ADD_MEMBER: (moradiaId: number, usuarioId: number) => `/moradias/${moradiaId}/adicionar-membro/${usuarioId}`,
      UPLOAD_IMAGE: (id: number) => `/moradias/image-upload/${id}`,
      GET_IMAGE: (id: number) => `/moradias/${id}/image`,
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
    DESPESAS: {
      BASE: "/despesas",
      BY_MORADIA: (id: number) => `/despesas/moradia/${id}`,
      DELETE: (id: number) => `/despesas/${id}`,
    }
  },

  TIMEOUT: 150000, // 150 segundos (aumentado para evitar timeouts prematuros)
};

export default API_CONFIG;
