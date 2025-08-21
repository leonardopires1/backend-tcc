import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { PlacesAutocomplete } from '../components/common/PlacesAutocomplete';
import { Coordinates, PlaceDetails } from '../config/googleMapsConfig';
import { Loading } from '../components/common/Loading';

const { width, height } = Dimensions.get('window');

export const GoogleMapsExampleScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceDetails[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [distance, setDistance] = useState<string>('');
  
  const {
    loading,
    geocodeAddress,
    reverseGeocode,
    searchPlaces,
    findNearbyPlaces,
    getDirections,
    getDistanceMatrix,
    isConfigured,
  } = useGoogleMaps();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setCurrentLocation(coords);
      
      // Buscar endereço da localização atual
      const address = await reverseGeocode(coords);
      if (address) {
        console.log('Endereço atual:', address.formatted_address);
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  };

  const handlePlaceSelected = async (place: any) => {
    const placeDetails: PlaceDetails = {
      place_id: place.place_id,
      formatted_address: place.description,
      name: place.description,
      geometry: place.geometry,
    };
    
    setSelectedPlace(placeDetails);
    
    if (currentLocation) {
      // Calcular rota
      await calculateRoute(currentLocation, {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      });
      
      // Calcular distância
      await calculateDistance(currentLocation, {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      });
    }
  };

  const calculateRoute = async (origin: Coordinates, destination: Coordinates) => {
    try {
      const directions = await getDirections(origin, destination);
      if (directions && directions.routes.length > 0) {
        const route = directions.routes[0];
        const coordinates: Coordinates[] = [];
        
        route.legs.forEach((leg: any) => {
          leg.steps.forEach((step: any) => {
            const points = decodePolyline(step.polyline.points);
            coordinates.push(...points);
          });
        });
        
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
    }
  };

  const calculateDistance = async (origin: Coordinates, destination: Coordinates) => {
    try {
      const matrix = await getDistanceMatrix([origin], [destination]);
      if (matrix && matrix.rows.length > 0 && matrix.rows[0].elements.length > 0) {
        const element = matrix.rows[0].elements[0];
        if (element.status === 'OK') {
          setDistance(`${element.distance.text} - ${element.duration.text}`);
        }
      }
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
    }
  };

  const searchNearbyRestaurants = async () => {
    if (!currentLocation) return;
    
    try {
      const places = await findNearbyPlaces(currentLocation, 1000, 'restaurant');
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
    }
  };

  const searchTextPlaces = async (query: string) => {
    if (!currentLocation) return;
    
    try {
      const places = await searchPlaces(query, currentLocation, 5000);
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
    }
  };

  // Função para decodificar polyline (simplificada)
  const decodePolyline = (encoded: string): Coordinates[] => {
    // Esta é uma versão simplificada. Para uso em produção,
    // use uma biblioteca como @mapbox/polyline
    const coordinates: Coordinates[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      coordinates.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }
    
    return coordinates;
  };

  if (!isConfigured()) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Google Maps API Key não configurada!
          {'\n'}
          Configure a API key em googleMapsConfig.ts
        </Text>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Loading />
        <Text style={styles.loadingText}>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buscar Endereço</Text>
        <PlacesAutocomplete
          placeholder="Digite um endereço..."
          onPlaceSelected={handlePlaceSelected}
          currentLocation={currentLocation}
          style={styles.autocomplete}
        />
      </View>

      {selectedPlace && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Selecionado</Text>
          <Text style={styles.placeText}>{selectedPlace.formatted_address}</Text>
          {distance && (
            <Text style={styles.distanceText}>Distância: {distance}</Text>
          )}
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {selectedPlace && (
            <Marker
              coordinate={{
                latitude: selectedPlace.geometry.location.lat,
                longitude: selectedPlace.geometry.location.lng,
              }}
              title={selectedPlace.name}
              description={selectedPlace.formatted_address}
            />
          )}
          
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#007AFF"
              strokeWidth={3}
            />
          )}

          {nearbyPlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.formatted_address}
              pinColor="orange"
            />
          ))}
        </MapView>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={searchNearbyRestaurants}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Buscando...' : 'Restaurantes Próximos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => searchTextPlaces('farmácia')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Buscando...' : 'Farmácias Próximas'}
          </Text>
        </TouchableOpacity>
      </View>

      {nearbyPlaces.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lugares Encontrados</Text>
          {nearbyPlaces.map((place, index) => (
            <View key={index} style={styles.placeItem}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.formatted_address}</Text>
              {place.rating && (
                <Text style={styles.placeRating}>⭐ {place.rating}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  autocomplete: {
    height: 45,
  },
  placeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  placeItem: {
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  placeRating: {
    fontSize: 14,
    color: '#FFA500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    margin: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
