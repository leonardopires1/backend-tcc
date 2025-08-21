import { useState, useCallback } from 'react';
import { googleMapsService } from '../services/googleMapsService';
import { Coordinates, PlaceDetails, Address } from '../config/googleMapsConfig';
import { useErrorHandling } from './useErrorHandling';

interface UseGoogleMapsReturn {
  // Estados
  loading: boolean;
  
  // Funções
  geocodeAddress: (address: string) => Promise<Coordinates | null>;
  reverseGeocode: (coordinates: Coordinates) => Promise<Address | null>;
  searchPlaces: (query: string, location?: Coordinates, radius?: number) => Promise<PlaceDetails[]>;
  findNearbyPlaces: (location: Coordinates, radius?: number, type?: string) => Promise<PlaceDetails[]>;
  getDirections: (origin: Coordinates | string, destination: Coordinates | string) => Promise<any>;
  getDistanceMatrix: (origins: Array<Coordinates | string>, destinations: Array<Coordinates | string>) => Promise<any>;
  getPlacePhotoUrl: (photoReference: string, maxWidth?: number) => string;
  
  // Validação
  isConfigured: () => boolean;
}

export const useGoogleMaps = (): UseGoogleMapsReturn => {
  const [loading, setLoading] = useState(false);
  const { executeWithErrorHandling } = useErrorHandling();

  const geocodeAddress = useCallback(async (address: string): Promise<Coordinates | null> => {
    setLoading(true);
    try {
      const result = await executeWithErrorHandling(
        () => googleMapsService.geocodeAddress(address),
        { showToUser: true, fallback: null }
      );
      return result || null;
    } finally {
      setLoading(false);
    }
  }, [executeWithErrorHandling]);

  const reverseGeocode = useCallback(async (coordinates: Coordinates): Promise<Address | null> => {
    setLoading(true);
    try {
      const result = await executeWithErrorHandling(
        () => googleMapsService.reverseGeocode(coordinates),
        { showToUser: true, fallback: null }
      );
      return result || null;
    } finally {
      setLoading(false);
    }
  }, [executeWithErrorHandling]);

  const searchPlaces = useCallback(async (
    query: string, 
    location?: Coordinates, 
    radius?: number
  ): Promise<PlaceDetails[]> => {
    setLoading(true);
    try {
      const result = await executeWithErrorHandling(
        () => googleMapsService.searchPlaces(query, location, radius),
        { showToUser: true, fallback: [] }
      );
      return result || [];
    } finally {
      setLoading(false);
    }
  }, [executeWithErrorHandling]);

  const findNearbyPlaces = useCallback(async (
    location: Coordinates, 
    radius: number = 1000, 
    type?: string
  ): Promise<PlaceDetails[]> => {
    setLoading(true);
    try {
      const result = await executeWithErrorHandling(
        () => googleMapsService.findNearbyPlaces(location, radius, type as any),
        { showToUser: true, fallback: [] }
      );
      return result || [];
    } finally {
      setLoading(false);
    }
  }, [executeWithErrorHandling]);

  const getDirections = useCallback(async (
    origin: Coordinates | string,
    destination: Coordinates | string
  ) => {
    setLoading(true);
    try {
      const result = await executeWithErrorHandling(
        () => googleMapsService.getDirections(origin, destination),
        { showToUser: true, fallback: null }
      );
      return result;
    } finally {
      setLoading(false);
    }
  }, [executeWithErrorHandling]);

  const getDistanceMatrix = useCallback(async (
    origins: Array<Coordinates | string>,
    destinations: Array<Coordinates | string>
  ) => {
    setLoading(true);
    try {
      const result = await executeWithErrorHandling(
        () => googleMapsService.getDistanceMatrix(origins, destinations),
        { showToUser: true, fallback: null }
      );
      return result;
    } finally {
      setLoading(false);
    }
  }, [executeWithErrorHandling]);

  const getPlacePhotoUrl = useCallback((photoReference: string, maxWidth: number = 400): string => {
    return googleMapsService.getPlacePhotoUrl(photoReference, maxWidth);
  }, []);

  const isConfigured = useCallback((): boolean => {
    return googleMapsService.isConfigured();
  }, []);

  return {
    loading,
    geocodeAddress,
    reverseGeocode,
    searchPlaces,
    findNearbyPlaces,
    getDirections,
    getDistanceMatrix,
    getPlacePhotoUrl,
    isConfigured,
  };
};
