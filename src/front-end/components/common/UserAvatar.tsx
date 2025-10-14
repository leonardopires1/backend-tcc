import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, View, Text, ViewStyle } from 'react-native';
import { getUserAvatarSource } from '../../services/imagesService';

interface UserAvatarProps extends Omit<ImageProps, 'source'> {
  userId: number;
  userName?: string;
  hasAvatar?: boolean;
  style?: StyleProp<ImageStyle>;
  fallbackStyle?: StyleProp<ViewStyle>;
  defaultSource?: any;
  showInitials?: boolean;
  withAuth?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  userName = '',
  hasAvatar = false, 
  style, 
  fallbackStyle,
  defaultSource,
  showInitials = true,
  withAuth = true,
  ...imageProps 
}) => {
  const [imageSource, setImageSource] = useState<{ uri: string; headers?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (hasAvatar) {
      loadAvatar();
    } else {
      setLoading(false);
      setImageSource(null);
    }
  }, [userId, hasAvatar]);

  const loadAvatar = async () => {
    try {
      setLoading(true);
      setError(false);
      
      console.log(`🔄 Carregando avatar do usuário ${userId}...`);
      
      const source = await getUserAvatarSource(userId, withAuth);
      setImageSource(source);
      
      console.log(`✅ Avatar do usuário ${userId} configurado`);
    } catch (err) {
      console.error(`❌ Erro ao carregar avatar do usuário ${userId}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!userName) return 'U';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  // Se não tem avatar ou houve erro, mostrar fallback
  if (!hasAvatar || error || !imageSource) {
    if (showInitials && userName) {
      return (
        <View style={[{
          backgroundColor: '#007AFF',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 25,
          width: 50,
          height: 50,
        }, fallbackStyle]}>
          <Text style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
          }}>
            {getInitials()}
          </Text>
        </View>
      );
    }

    // Se não tem nome para mostrar iniciais, mostrar ícone de usuário
    return (
      <View style={[{
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        width: 50,
        height: 50,
      }, fallbackStyle]}>
        <Text style={{
          color: '#666',
          fontSize: 20,
        }}>
          👤
        </Text>
      </View>
    );
  }

  // Se está carregando, mostrar fallback temporariamente
  if (loading) {
    if (showInitials && userName) {
      return (
        <View style={[{
          backgroundColor: '#007AFF',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 25,
          width: 50,
          height: 50,
        }, fallbackStyle]}>
          <Text style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
          }}>
            {getInitials()}
          </Text>
        </View>
      );
    }

    return (
      <View style={[{
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        width: 50,
        height: 50,
      }, fallbackStyle]}>
        <Text style={{
          color: '#666',
          fontSize: 20,
        }}>
          👤
        </Text>
      </View>
    );
  }

  // Mostrar avatar carregado
  return (
    <Image
      source={imageSource}
      style={style}
      onError={() => {
        console.error(`❌ Erro ao exibir avatar do usuário ${userId}`);
        setError(true);
      }}
      {...imageProps}
    />
  );
};

export default UserAvatar;
