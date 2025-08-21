import React from 'react';
import { Text } from 'react-native';

interface SafeTextProps {
  children: any;
  style?: any;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

// Componente Text que protege contra renderização de objetos
export const SafeText: React.FC<SafeTextProps> = ({ 
  children, 
  style, 
  numberOfLines, 
  ellipsizeMode 
}) => {
  // Função para converter qualquer valor em string segura
  const getSafeText = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (typeof value === 'object') {
      // Se é um objeto com message, usar a message
      if (value.message && typeof value.message === 'string') {
        return value.message;
      }
      
      // Se é um objeto com error, usar o error
      if (value.error && typeof value.error === 'string') {
        return value.error;
      }
      
      // Se é um array, juntar os elementos
      if (Array.isArray(value)) {
        return value.map(getSafeText).join(', ');
      }
      
      // Fallback: converter para JSON (último recurso)
      try {
        return JSON.stringify(value);
      } catch {
        return '[Objeto complexo]';
      }
    }
    
    return String(value);
  };

  return (
    <Text 
      style={style}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {getSafeText(children)}
    </Text>
  );
};
