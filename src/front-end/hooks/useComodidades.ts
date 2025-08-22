import { useCallback, useEffect, useState } from 'react';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';

export interface Comodidade {
  id: number;
  nome: string;
  descricao?: string;
  moradiaId: number;
}

interface UseComodidadesReturn {
  comodidades: Comodidade[];
  loading: boolean;
  error: string | null;
  fetchComodidades: (moradiaId: number) => Promise<void>;
  addComodidade: (moradiaId: number, nome: string, descricao?: string) => Promise<boolean>;
  removeComodidade: (comodidadeId: number) => Promise<boolean>;
}

export const useComodidades = (moradiaId?: number): UseComodidadesReturn => {
  const [comodidades, setComodidades] = useState<Comodidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComodidades = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = API_CONFIG.ENDPOINTS.COMODIDADES.BY_MORADIA(id);
      const res = await HttpService.get<Comodidade[]>(endpoint);
      if (res.ok && res.data) {
        setComodidades(res.data);
      } else {
        setError(res.error || 'Erro ao carregar comodidades');
      }
    } catch (e: any) {
      setError(e.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComodidade = useCallback(async (idMoradia: number, nome: string, descricao = '') => {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COMODIDADES.BASE}/comodidades/${idMoradia}`;
      const res = await HttpService.post<Comodidade>(endpoint, { nome, descricao });
      if (res.ok && res.data) {
        setComodidades(prev => [...prev, res.data!]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const removeComodidade = useCallback(async (comodidadeId: number) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.COMODIDADES.DELETE(comodidadeId);
      const res = await HttpService.delete(endpoint);
      if (res.ok) {
        setComodidades(prev => prev.filter(c => c.id !== comodidadeId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (moradiaId) {
      fetchComodidades(moradiaId);
    }
  }, [moradiaId, fetchComodidades]);

  return {
    comodidades,
    loading,
    error,
    fetchComodidades,
    addComodidade,
    removeComodidade,
  };
};

export default useComodidades;