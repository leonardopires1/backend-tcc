import { Client } from '@googlemaps/google-maps-services-js';

// IMPORTANTE: Adicione suas API keys nas variáveis de ambiente
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: __DEV__ 
    ? 'SUA_API_KEY_AQUI' // Substitua pela sua API key
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Configurações específicas para diferentes serviços
  GEOCODING: {
    language: 'pt-BR',
    region: 'BR',
  },
  
  PLACES: {
    language: 'pt-BR',
    region: 'BR',
    types: 'address', // Para buscar endereços
  },
  
  DIRECTIONS: {
    language: 'pt-BR',
    units: 'metric',
  },
};

// Cliente para fazer chamadas para as APIs do Google Maps
export const googleMapsClient = new Client({});

// Tipos para facilitar o desenvolvimento
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
}
