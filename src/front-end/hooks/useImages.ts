import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';

export interface ImageFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface UseImagesReturn {
  isUploading: boolean;
  uploadProgress: number;
  pickImageFromGallery: () => Promise<ImageFile | null>;
  pickImageFromCamera: () => Promise<ImageFile | null>;
  uploadMoradiaImage: (moradiaId: number, imageFile: ImageFile) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  uploadUserAvatar: (userId: number, imageFile: ImageFile, onSuccess?: () => void) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  showImagePickerOptions: (onImageSelected: (image: ImageFile) => void) => void;
}

export const useImages = (): UseImagesReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Solicitar permissões de câmera e galeria
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
        Alert.alert(
          'Permissões necessárias',
          'Precisamos de permissão para acessar sua câmera e galeria de fotos.'
        );
        return false;
      }
    }
    return true;
  };

  // Selecionar imagem da galeria
  const pickImageFromGallery = async (): Promise<ImageFile | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        };
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem da galeria:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem da galeria');
    }
    
    return null;
  };

  // Capturar foto com a câmera
  const pickImageFromCamera = async (): Promise<ImageFile | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: `camera_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize,
        };
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      Alert.alert('Erro', 'Erro ao capturar foto');
    }
    
    return null;
  };

  // Mostrar opções de seleção de imagem
  const showImagePickerOptions = (onImageSelected: (image: ImageFile) => void) => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha de onde você quer selecionar a imagem',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const image = await pickImageFromGallery();
            if (image) {
              onImageSelected(image);
            }
          },
        },
        {
          text: 'Câmera',
          onPress: async () => {
            const image = await pickImageFromCamera();
            if (image) {
              onImageSelected(image);
            }
          },
        },
      ]
    );
  };

  // Upload de imagem para moradia
  const uploadMoradiaImage = async (
    moradiaId: number, 
    imageFile: ImageFile
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    console.log('🔄 Iniciando upload da imagem da moradia:', { moradiaId, fileName: imageFile.name });
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validar tamanho do arquivo (máximo 5MB)
      if (imageFile.size && imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB permitido.');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      } as any);

      console.log('📤 Fazendo upload para endpoint:', API_CONFIG.ENDPOINTS.MORADIAS.UPLOAD_IMAGE(moradiaId));

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await HttpService.uploadFile(
        API_CONFIG.ENDPOINTS.MORADIAS.UPLOAD_IMAGE(moradiaId),
        formData
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📥 Resposta do upload:', response);

      if (response.ok && response.data) {
        const data = response.data as any;
        console.log('✅ Upload concluído com sucesso:', data);
        return {
          success: true,
          imageUrl: data.imagemUrl || data.imagePath,
        };
      } else {
        console.error('❌ Erro na resposta do upload:', response.error);
        throw new Error(response.error || 'Erro ao fazer upload da imagem');
      }

    } catch (error: any) {
      console.error('❌ Erro no upload da imagem da moradia:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer upload da imagem',
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload de avatar do usuário
  const uploadUserAvatar = async (
    userId: number, 
    imageFile: ImageFile,
    onSuccess?: () => void
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    console.log('🔄 Iniciando upload do avatar do usuário:', { userId, fileName: imageFile.name });
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validar tamanho do arquivo (máximo 2MB para avatar)
      if (imageFile.size && imageFile.size > 2 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 2MB permitido para avatares.');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      } as any);

      console.log('📤 Fazendo upload do avatar para endpoint:', API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR(userId));

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await HttpService.uploadFile(
        API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR(userId),
        formData
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📥 Resposta do upload do avatar:', response);

      if (response.ok && response.data) {
        const data = response.data as any;
        console.log('✅ Upload do avatar concluído com sucesso:', data);
        
        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          console.log('🔄 Executando callback de sucesso...');
          onSuccess();
        }
        
        return {
          success: true,
          imageUrl: data.avatarFileName || data.avatarUrl || data.imagePath,
        };
      } else {
        console.error('❌ Erro na resposta do upload do avatar:', response.error);
        throw new Error(response.error || 'Erro ao fazer upload do avatar');
      }

    } catch (error: any) {
      const errorMessage = error.message || error.toString() || 'Erro desconhecido ao fazer upload do avatar';
      console.error('❌ Erro no upload do avatar:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    pickImageFromGallery,
    pickImageFromCamera,
    uploadMoradiaImage,
    uploadUserAvatar,
    showImagePickerOptions,
  };
};
