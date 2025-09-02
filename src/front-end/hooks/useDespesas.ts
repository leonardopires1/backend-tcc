import { useCallback, useState } from "react";
import API_CONFIG from "../config/apiConfig";
import httpService from "../services/httpService";

export interface Despesa {
    titulo: string;
    valorTotal: number;
    vencimento: Date;
    tipo: string;
    idDespesa: number;
    idsUsuarios: number[];
}

interface UseDespesasReturn {
  despesas: Despesa[];
  loading: boolean;
  error: string | null;
  fetchDespesas: (idMoradia: number) => Promise<void>;
  addDespesa: (idMoradia: number, titulo: string, valorTotal: number, vencimento: Date, tipo: string, idsUsuarios: number[]) => Promise<boolean>;
  removeDespesa: (despesaId: number) => Promise<boolean>;
}

export const useDespesas = (moradiaId: number): UseDespesasReturn => {
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDespesas = useCallback(async (idMoradia: number) => {
        setLoading(true);
        setError(null);
        const endpoint = API_CONFIG.ENDPOINTS.DESPESAS.BY_MORADIA(idMoradia);
        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setDespesas(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const addDespesa = useCallback(async (idMoradia: number, titulo: string, valorTotal: number, vencimento: Date, tipo: string, idsUsuarios: number[]) => {
        setLoading(true);
        setError(null);
        const endpoint = API_CONFIG.ENDPOINTS.DESPESAS.BASE;
        try {
            const response = await httpService.post<Despesa>(endpoint, {
                moradiaId: idMoradia,
                titulo,
                valorTotal,
                vencimento,
                tipo,
                idsUsuarios
            });
            if (response.ok && response.data) {
                setDespesas((prev) => [...prev, response.data!]);
                return true;
            }
            return false;
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeDespesa = useCallback(async (despesaId: number) => {
        setLoading(true);
        setError(null);
        const endpoint = API_CONFIG.ENDPOINTS.DESPESAS.BASE;
        try {
            const response = await httpService.delete(`${endpoint}/${despesaId}`);
            if (response.ok) {
                setDespesas((prev) => prev.filter((d) => d.idDespesa !== despesaId));
                return true;
            }
            return false;
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        despesas,
        loading,
        error,
        fetchDespesas,
        addDespesa,
        removeDespesa
    };
}
