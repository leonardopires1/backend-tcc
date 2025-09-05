import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useImages, ImageFile } from '../hooks/useImages';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface ImageUploadComponentProps {
  currentImageUrl?: string | null;
  onImageSelected?: (image: ImageFile) => void;
  onImageUploaded?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  placeholder?: string;
  subtext?: string;
  style?: any;
  disabled?: boolean;
  uploadType?: 'moradia' | 'avatar';
  entityId?: number;
  imageStyle?: any;
  containerStyle?: any;
  showProgress?: boolean;
}

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  currentImageUrl,
  onImageSelected,
  onImageUploaded,
  onUploadError,
  placeholder = "Adicionar imagem",
  subtext = "Toque para selecionar uma imagem",
  style,
  disabled = false,
  uploadType = 'moradia',
  entityId,
  imageStyle,
  containerStyle,
  showProgress = true,
}) => {
  const { 
    isUploading, 
    uploadProgress, 
    uploadMoradiaImage, 
    uploadUserAvatar,
    showImagePickerOptions 
  } = useImages();

  const handleSelectImage = () => {
    if (disabled || isUploading) return;

    showImagePickerOptions(async (image: ImageFile) => {
      onImageSelected?.(image);

      // Se foi fornecido um entityId, fazer upload automaticamente
      if (entityId) {
        try {
          let uploadResult;
          
          if (uploadType === 'avatar') {
            uploadResult = await uploadUserAvatar(entityId, image);
          } else {
            uploadResult = await uploadMoradiaImage(entityId, image);
          }

          if (uploadResult.success && uploadResult.imageUrl) {
            onImageUploaded?.(uploadResult.imageUrl);
          } else {
            onUploadError?.(uploadResult.error || 'Erro no upload da imagem');
          }
        } catch (error: any) {
          onUploadError?.(error.message || 'Erro no upload da imagem');
        }
      }
    });
  };

  const renderContent = () => {
    if (currentImageUrl) {
      return (
        <View style={[styles.imageContainer, containerStyle]}>
          <Image 
            source={{ uri: currentImageUrl }} 
            style={[styles.selectedImage, imageStyle]} 
          />
          <View style={styles.imageOverlay}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.placeholderContainer, style]}>
        <Ionicons 
          name="camera-outline" 
          size={32} 
          color={disabled ? COLORS.GRAY_LIGHT : COLORS.PRIMARY} 
        />
        <Text style={[
          styles.placeholderText, 
          { color: disabled ? COLORS.GRAY_LIGHT : COLORS.PRIMARY }
        ]}>
          {placeholder}
        </Text>
        <Text style={[
          styles.placeholderSubtext,
          { color: disabled ? COLORS.GRAY_LIGHT : COLORS.TEXT_SECONDARY }
        ]}>
          {subtext}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleSelectImage}
        disabled={disabled || isUploading}
        activeOpacity={0.7}
        style={[
          styles.touchableContainer,
          disabled && styles.disabledContainer
        ]}
      >
        {renderContent()}
        
        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          </View>
        )}
      </TouchableOpacity>

      {isUploading && showProgress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Fazendo upload...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{uploadProgress}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  touchableContainer: {
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    minHeight: 120,
  },
  placeholderText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    marginTop: SPACING.SM,
  },
  placeholderSubtext: {
    fontSize: FONT_SIZES.SM,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: SPACING.MD,
    paddingHorizontal: SPACING.SM,
  },
  progressText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.XS,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
