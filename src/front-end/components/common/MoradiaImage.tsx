import React, { useEffect, useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API_CONFIG from '../../config/apiConfig';
import { getMoradiaImageSource } from '../../services/imagesService';

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
  withAuth?: boolean; // permite enviar Authorization header se necessário
}

const MoradiaImage: React.FC<MoradiaImageProps> = ({
  moradiaId,
  hasImage = false,
  style,
  defaultSource,
  withAuth = false,
  ...imageProps
}) => {
  const [error, setError] = useState(false);
  const [source, setSource] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const imgSource = await getMoradiaImageSource(moradiaId, withAuth);
        if (mounted) {
          setSource(imgSource);
          console.log(`🖼️ Exibindo imagem da moradia ${moradiaId}: ${imgSource.uri}${imgSource.headers ? ' (com Authorization)' : ''}`);
        }
      } catch (e) {
        console.error('Erro ao montar source da imagem:', e);
        setError(true);
      }
    })();
    return () => { mounted = false; };
  }, [moradiaId, withAuth]);

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
    if (defaultMoradiaImage) {
      return (
        <Image
          source={defaultMoradiaImage}
          style={style}
          {...imageProps}
        />
      );
    }
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

  if (!source) {
    return (
      <View style={[{
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
      }, style]}>
        <Ionicons name="image-outline" size={24} color="#999" />
      </View>
    );
  }

  // Mostrar imagem do servidor
  return (
    <Image
      source={source as any}
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
