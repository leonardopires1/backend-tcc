import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Moradia from "../types/Moradia";

interface MoradiaCardProps {
  moradia: Moradia;
  onPress?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function MoradiaCard({ 
  moradia, 
  onPress, 
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle 
}: MoradiaCardProps) {
  const renderAmenities = () => {
    if (!moradia.comodidades || moradia.comodidades.length === 0) {
      return null;
    }

    const displayedAmenities = moradia.comodidades.slice(0, 3);
    const remainingCount = moradia.comodidades.length - 3;

    return (
      <View style={styles.amenitiesContainer}>
        {displayedAmenities.map((comodidade, index) => (
          <View key={index} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{comodidade}</Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <Text style={styles.moreAmenities}>+{remainingCount} mais</Text>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: moradia.imagens?.[0] || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        {showFavorite && (
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={onFavoriteToggle}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF4757" : "#FFF"}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {moradia.nome}
        </Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {moradia.endereco}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {moradia.descricao}
        </Text>
        
        {renderAmenities()}
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            R$ {moradia.preco?.toLocaleString('pt-BR') || '0'}/mês
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    alignItems: 'center',
  },
  amenityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 11,
    color: '#0073FF',
    fontWeight: '500',
  },
  moreAmenities: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0073FF',
  },
});