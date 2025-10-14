import HttpService from './httpService';
import API_CONFIG from '../config/apiConfig';

export type ImageSourceDescriptor = {
  uri: string;
  headers?: Record<string, string>;
};

export type BasicImageFile = {
  uri: string;
  name: string;
  type: string;
};

// Retorna a fonte (uri + headers) para carregar imagem de moradia
export async function getMoradiaImageSource(moradiaId: number, withAuth = true): Promise<ImageSourceDescriptor> {
  const uri = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MORADIAS.GET_IMAGE(moradiaId)}`;

  if (!withAuth) return { uri };

  // Somente enviar Authorization; evitar Content-Type em GET
  const headers = await HttpService.getAuthHeaders();
  const { Authorization } = headers;
  return Authorization ? { uri, headers: { Authorization } } : { uri };
}

export async function getUserAvatarSource(userId: number, withAuth = true): Promise<ImageSourceDescriptor> {
  const uri = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.GET_AVATAR(userId)}`;

  if (!withAuth) return { uri };

  // Sempre enviar Authorization por enquanto (servidor ainda requer auth)
  const headers = await HttpService.getAuthHeaders();
  const { Authorization } = headers;
  return Authorization ? { uri, headers: { Authorization } } : { uri };
}

// Upload de imagem da moradia (com JWT por padrão)
export async function uploadMoradiaImage(moradiaId: number, file: BasicImageFile, requiresAuth = true) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  return HttpService.uploadFile(
    API_CONFIG.ENDPOINTS.MORADIAS.UPLOAD_IMAGE(moradiaId),
    formData,
    requiresAuth,
  );
}

// Upload de avatar do usuário (com JWT por padrão)
export async function uploadUserAvatar(userId: number, file: BasicImageFile, requiresAuth = true) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  return HttpService.uploadFile(
    API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR(userId),
    formData,
    requiresAuth,
  );
}

export default {
  getMoradiaImageSource,
  getUserAvatarSource,
  uploadMoradiaImage,
  uploadUserAvatar,
};
