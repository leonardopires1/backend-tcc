import { useCallback, useEffect, useState } from "react";
import HttpService from "../services/httpService";
import API_CONFIG from "../config/apiConfig";

export interface RegraPredefinida {
  id: number;
  titulo: string;
  descricao?: string;
}

interface RegraVinculada {
  regraId: number;
  titulo: string;
  descricao?: string;
}

interface UseRegrasReturn {
  regras: RegraPredefinida[];
  regrasVinculadas: RegraVinculada[];
  loading: boolean;
  loadingVinculadas: boolean;
  error: string | null;
  fetchRegras: () => Promise<void>;
  fetchRegrasVinculadas: (moradiaId: number) => Promise<void>;
  vincularRegra: (moradiaId: number, regraId: number) => Promise<boolean>;
  desvincularRegra: (moradiaId: number, regraId: number) => Promise<boolean>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 min
let cacheRegras: { ts: number; data: RegraPredefinida[] } | null = null;

export const useRegras = (): UseRegrasReturn => {
  const [regras, setRegras] = useState<RegraPredefinida[]>([]);
  const [regrasVinculadas, setRegrasVinculadas] = useState<RegraVinculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVinculadas, setLoadingVinculadas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegras = useCallback(async () => {
    if (cacheRegras && Date.now() - cacheRegras.ts < CACHE_TTL) {
      setRegras(cacheRegras.data);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await HttpService.get<RegraPredefinida[]>(API_CONFIG.ENDPOINTS.REGRAS.GET_ALL, true);
      if (res.ok && res.data) {
        setRegras(res.data);
        cacheRegras = { ts: Date.now(), data: res.data };
      } else {
        setError(res.error || 'Erro ao carregar regras');
      }
    } catch (e: any) {
      setError(e.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegrasVinculadas = useCallback(async (moradiaId: number) => {
    if (!moradiaId) return;
    try {
      setLoadingVinculadas(true);
      const res = await HttpService.get<any[]>(API_CONFIG.ENDPOINTS.REGRAS.BY_MORADIA(moradiaId), true);
      if (res.ok && res.data) {
        const mapped: RegraVinculada[] = res.data.map(r => ({ regraId: r.regra.id, titulo: r.regra.titulo, descricao: r.regra.descricao }));
        setRegrasVinculadas(mapped);
      }
    } finally {
      setLoadingVinculadas(false);
    }
  }, []);

  const vincularRegra = useCallback(async (moradiaId: number, regraId: number) => {
    try {
      const res = await HttpService.post(API_CONFIG.ENDPOINTS.REGRAS.REGISTER(moradiaId, regraId), undefined, true);
      if (res.ok) {
        const regra = regras.find(r => r.id === regraId);
        if (regra && !regrasVinculadas.some(rv => rv.regraId === regraId)) {
          setRegrasVinculadas(prev => [...prev, { regraId: regra.id, titulo: regra.titulo, descricao: regra.descricao }]);
        }
      }
      return res.ok;
    } catch {
      return false;
    }
  }, [regras, regrasVinculadas]);

  const desvincularRegra = useCallback(async (moradiaId: number, regraId: number) => {
    try {
      const res = await HttpService.delete(API_CONFIG.ENDPOINTS.REGRAS.UNLINK(moradiaId, regraId), true);
      if (res.ok) {
        setRegrasVinculadas(prev => prev.filter(r => r.regraId !== regraId));
      }
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    fetchRegras();
  }, [fetchRegras]);

  return { regras, regrasVinculadas, loading, loadingVinculadas, error, fetchRegras, fetchRegrasVinculadas, vincularRegra, desvincularRegra };
};

export default useRegras;
