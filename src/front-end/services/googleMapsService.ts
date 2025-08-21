import { googleMapsClient, GOOGLE_MAPS_CONFIG, Coordinates, Address, PlaceDetails } from '../config/googleMapsConfig';
import { AddressType, PlaceType1, PlaceType2, Language, UnitSystem } from '@googlemaps/google-maps-services-js';

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.API_KEY;
    
    if (!this.apiKey) {
      console.error('API Key do Google Maps não configurada!');
    }
  }

  /**
   * Geocodificação: Converte endereço em coordenadas
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      const response = await googleMapsClient.geocode({
        params: {
          address,
          key: this.apiKey,
          language: GOOGLE_MAPS_CONFIG.GEOCODING.language as Language,
          region: GOOGLE_MAPS_CONFIG.GEOCODING.region,
        },
      });

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      throw new Error('Não foi possível obter as coordenadas do endereço');
    }
  }

  /**
   * Geocodificação reversa: Converte coordenadas em endereço
   */
  async reverseGeocode(coordinates: Coordinates): Promise<Address | null> {
    try {
      const response = await googleMapsClient.reverseGeocode({
        params: {
          latlng: `${coordinates.latitude},${coordinates.longitude}`,
          key: this.apiKey,
          language: GOOGLE_MAPS_CONFIG.GEOCODING.language as Language,
        },
      });

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          geometry: {
            location: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            },
          },
          address_components: result.address_components,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      throw new Error('Não foi possível obter o endereço das coordenadas');
    }
  }

  /**
   * Busca de lugares por texto
   */
  async searchPlaces(query: string, location?: Coordinates, radius?: number): Promise<PlaceDetails[]> {
    try {
      const params: any = {
        query,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.PLACES.language,
        region: GOOGLE_MAPS_CONFIG.PLACES.region,
      };

      if (location && radius) {
        params.location = `${location.latitude},${location.longitude}`;
        params.radius = radius;
      }

      const response = await googleMapsClient.textSearch({
        params,
      });

      return response.data.results.map(place => ({
        place_id: place.place_id || '',
        formatted_address: place.formatted_address || '',
        name: place.name || '',
        geometry: {
          location: {
            lat: place.geometry?.location.lat || 0,
            lng: place.geometry?.location.lng || 0,
          },
        },
        rating: place.rating,
        photos: place.photos?.map(photo => ({
          photo_reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
      }));
    } catch (error) {
      console.error('Erro na busca de lugares:', error);
      throw new Error('Não foi possível buscar os lugares');
    }
  }

  /**
   * Busca lugares próximos
   */
  async findNearbyPlaces(
    location: Coordinates, 
    radius: number = 1000, 
    type?: PlaceType1 | PlaceType2
  ): Promise<PlaceDetails[]> {
    try {
      const params: any = {
        location: `${location.latitude},${location.longitude}`,
        radius,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.PLACES.language,
      };

      if (type) {
        params.type = type;
      }

      const response = await googleMapsClient.placesNearby({
        params,
      });

      return response.data.results.map(place => ({
        place_id: place.place_id || '',
        formatted_address: place.vicinity || '',
        name: place.name || '',
        geometry: {
          location: {
            lat: place.geometry?.location.lat || 0,
            lng: place.geometry?.location.lng || 0,
          },
        },
        rating: place.rating,
        photos: place.photos?.map(photo => ({
          photo_reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
      }));
    } catch (error) {
      console.error('Erro na busca de lugares próximos:', error);
      throw new Error('Não foi possível buscar lugares próximos');
    }
  }

  /**
   * Calcula rota entre dois pontos
   */
  async getDirections(
    origin: Coordinates | string,
    destination: Coordinates | string,
    waypoints?: Array<Coordinates | string>
  ) {
    try {
      const originStr = typeof origin === 'string' 
        ? origin 
        : `${origin.latitude},${origin.longitude}`;
      
      const destinationStr = typeof destination === 'string'
        ? destination
        : `${destination.latitude},${destination.longitude}`;

      const params: any = {
        origin: originStr,
        destination: destinationStr,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.DIRECTIONS.language as Language,
        units: GOOGLE_MAPS_CONFIG.DIRECTIONS.units as UnitSystem,
      };

      if (waypoints && waypoints.length > 0) {
        params.waypoints = waypoints.map(point => 
          typeof point === 'string' 
            ? point 
            : `${point.latitude},${point.longitude}`
        ).join('|');
      }

      const response = await googleMapsClient.directions({
        params,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao obter direções:', error);
      throw new Error('Não foi possível calcular a rota');
    }
  }

  /**
   * Calcula distância entre dois pontos
   */
  async getDistanceMatrix(
    origins: Array<Coordinates | string>,
    destinations: Array<Coordinates | string>
  ) {
    try {
      const originsStr = origins.map(origin =>
        typeof origin === 'string' 
          ? origin 
          : `${origin.latitude},${origin.longitude}`
      );

      const destinationsStr = destinations.map(destination =>
        typeof destination === 'string'
          ? destination
          : `${destination.latitude},${destination.longitude}`
      );

      const response = await googleMapsClient.distancematrix({
        params: {
          origins: originsStr,
          destinations: destinationsStr,
          key: this.apiKey,
          language: GOOGLE_MAPS_CONFIG.DIRECTIONS.language as Language,
          units: GOOGLE_MAPS_CONFIG.DIRECTIONS.units as UnitSystem,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao calcular matriz de distância:', error);
      throw new Error('Não foi possível calcular as distâncias');
    }
  }

  /**
   * Obtém URL para foto de um lugar
   */
  getPlacePhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Valida se a API key está configurada
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'SUA_API_KEY_AQUI';
  }
}

// Instância singleton do serviço
export const googleMapsService = new GoogleMapsService();
