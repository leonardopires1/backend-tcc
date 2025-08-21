import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_CONFIG } from '../../config/googleMapsConfig';

interface PlacesAutocompleteProps {
  placeholder?: string;
  onPlaceSelected: (place: {
    description: string;
    place_id: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }) => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
  types?: string;
  country?: string;
  style?: any;
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  placeholder = 'Buscar endereço...',
  onPlaceSelected,
  currentLocation,
  radius = 2000,
  types = 'address',
  country = 'br',
  style,
}) => {
  if (!GOOGLE_MAPS_CONFIG.API_KEY || GOOGLE_MAPS_CONFIG.API_KEY === 'SUA_API_KEY_AQUI') {
    console.warn('Google Maps API Key não configurada!');
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          if (details) {
            onPlaceSelected({
              description: data.description,
              place_id: data.place_id,
              geometry: details.geometry,
            });
          }
        }}
        query={{
          key: GOOGLE_MAPS_CONFIG.API_KEY,
          language: 'pt-BR',
          types: types,
          components: `country:${country}`,
          ...(currentLocation && {
            location: `${currentLocation.latitude},${currentLocation.longitude}`,
            radius: radius,
          }),
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          predefinedPlacesDescription: styles.predefinedPlacesDescription,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
        textInputProps={{
          autoCapitalize: 'none',
          autoCorrect: false,
          placeholderTextColor: '#999',
        }}
        debounce={300}
        minLength={2}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
        GoogleReverseGeocodingQuery={{
          // Configurações para geocodificação reversa
        }}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  textInputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  textInput: {
    marginLeft: 0,
    marginRight: 0,
    height: 45,
    color: '#000',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderTopWidth: 0,
    borderRadius: 8,
    marginTop: -1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  description: {
    fontSize: 14,
    color: '#000',
  },
});
