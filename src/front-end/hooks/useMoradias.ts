import { useState, useEffect, useCallback } from 'react';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';
import Moradia from '../types/Moradia';

interface UseMoradiasReturn {
  moradias: Moradia[];
  loading: boolean;
  error: string | null;
  refreshMoradias: () => Promise<void>;
  createMoradia: (moradiaData: Partial<Moradia>) => Promise<{ success: boolean; message?: string; data?: Moradia }>;
  updateMoradia: (id: number, moradiaData: Partial<Moradia>) => Promise<{ success: boolean; message?: string }>;
  deleteMoradia: (id: number) => Promise<{ success: boolean; message?: string }>;
  getMoradiaById: (id: number) => Promise<Moradia | null>;
}

export const useMoradias = (): UseMoradiasReturn => {
  const [moradias, setMoradias] = useState<Moradia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoradias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await HttpService.get<Moradia[]>(API_CONFIG.ENDPOINTS.MORADIAS.BASE);
      
      if (response.ok && response.data) {
        setMoradias(response.data);
      } else {
        setError(response.error || 'Erro ao carregar moradias');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMoradias = useCallback(async () => {
    await fetchMoradias();
  }, [fetchMoradias]);

  const createMoradia = useCallback(async (moradiaData: Partial<Moradia>) => {
    try {
      const response = await HttpService.post<Moradia>(API_CONFIG.ENDPOINTS.MORADIAS.BASE, moradiaData);
      
      if (response.ok && response.data) {
        setMoradias(prev => [...prev, response.data!]);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.error || 'Erro ao criar moradia' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro inesperado' };
    }
  }, []);

  const updateMoradia = useCallback(async (id: number, moradiaData: Partial<Moradia>) => {
    try {
      const response = await HttpService.put<Moradia>(API_CONFIG.ENDPOINTS.MORADIAS.BY_ID(id), moradiaData);
      
      if (response.ok && response.data) {
        setMoradias(prev => prev.map(m => m.id === id ? response.data! : m));
        return { success: true };
      } else {
        return { success: false, message: response.error || 'Erro ao atualizar moradia' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro inesperado' };
    }
  }, []);

  const deleteMoradia = useCallback(async (id: number) => {
    try {
      const response = await HttpService.delete(API_CONFIG.ENDPOINTS.MORADIAS.BY_ID(id));
      
      if (response.ok) {
        setMoradias(prev => prev.filter(m => m.id !== id));
        return { success: true };
      } else {
        return { success: false, message: response.error || 'Erro ao deletar moradia' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro inesperado' };
    }
  }, []);

  const getMoradiaById = useCallback(async (id: number): Promise<Moradia | null> => {
    try {
      const response = await HttpService.get<Moradia>(API_CONFIG.ENDPOINTS.MORADIAS.BY_ID(id));
      
      if (response.ok && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar moradia:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMoradias();
  }, [fetchMoradias]);

  return {
    moradias,
    loading,
    error,
    refreshMoradias,
    createMoradia,
    updateMoradia,
    deleteMoradia,
    getMoradiaById,
  };
};
