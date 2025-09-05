import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API_CONFIG from '../../config/apiConfig';

// Tentar importar a imagem padrão de forma segura
let defaultMoradiaImage: any = null;
try {
  defaultMoradiaImage = require('../../assets/fotoDefaultMoradia.jpg');
} catch {
  try {
    defaultMoradiaImage = require('../../assets/01.jpg');
  } catch {
    // Se nenhuma imagem funcionar, usaremos apenas ícones
    defaultMoradiaImage = null;
  }
}

interface MoradiaImageProps extends Omit<ImageProps, 'source'> {
  moradiaId: number;
  hasImage?: boolean;
  style?: StyleProp<ImageStyle>;
  defaultSource?: any;
}

const MoradiaImage: React.FC<MoradiaImageProps> = ({ 
  moradiaId, 
  hasImage = false, 
  style, 
  defaultSource,
  ...imageProps 
}) => {
  const [error, setError] = useState(false);

  // Se não tem imagem ou houve erro, mostrar imagem padrão ou ícone
  if (!hasImage || error) {
    if (defaultSource) {
      return (
        <Image
          source={defaultSource}
          style={style}
          {...imageProps}
        />
      );
    }
    
    // Usar imagem padrão se disponível
    if (defaultMoradiaImage) {
      return (
        <Image
          source={defaultMoradiaImage}
          style={style}
          {...imageProps}
        />
      );
    }
    
    // Fallback para ícone se não há imagem padrão
    return (
      <View style={[{
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
      }, style]}>
        <Ionicons name="home-outline" size={40} color="#999" />
      </View>
    );
  }

  // Construir URL da imagem
  const imageEndpoint = API_CONFIG.ENDPOINTS.MORADIAS.GET_IMAGE(moradiaId);
  const imageUrl = `${API_CONFIG.BASE_URL}${imageEndpoint}`;

  console.log(`🖼️ Exibindo imagem da moradia ${moradiaId}: ${imageUrl}`);

  // Mostrar imagem do servidor
  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      onError={(error) => {
        console.error(`❌ Erro ao exibir imagem da moradia ${moradiaId}:`, error.nativeEvent);
        setError(true);
      }}
      onLoad={() => {
        console.log(`✅ Imagem da moradia ${moradiaId} carregada com sucesso`);
      }}
      {...imageProps}
    />
  );
};

export default MoradiaImage;
