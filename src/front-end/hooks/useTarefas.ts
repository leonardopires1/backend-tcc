import { useState, useEffect } from 'react';
import tarefaService from '../services/tarefaService';
import { Tarefa, CreateTarefaDto, UpdateTarefaDto } from '../types/Tarefa';

export const useTarefas = (moradiaId?: number) => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTarefas = async () => {
    setLoading(true);
    setError(null);
    try {
      let filteredTarefas: Tarefa[];
      
      if (moradiaId) {
        // Se temos moradiaId, buscar tarefas específicas da moradia
        filteredTarefas = await tarefaService.getTarefasByMoradia(moradiaId);
      } else {
        // Senão, buscar todas e filtrar (comportamento original)
        const allTarefas = await tarefaService.getAllTarefas();
        filteredTarefas = allTarefas;
      }
      
      setTarefas(filteredTarefas);
    } catch (err) {
      setError('Erro ao carregar tarefas');
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTarefa = async (tarefaData: CreateTarefaDto): Promise<boolean> => {
    setError(null);
    try {
      const novaTarefa = await tarefaService.createTarefa(tarefaData);
      if (novaTarefa) {
        setTarefas(prev => [...prev, novaTarefa]);
        return true;
      }
      return false;
    } catch (err) {
      setError('Erro ao criar tarefa');
      console.error('Erro ao criar tarefa:', err);
      return false;
    }
  };

  const updateTarefa = async (id: number, tarefaData: UpdateTarefaDto): Promise<boolean> => {
    setError(null);
    try {
      const tarefaAtualizada = await tarefaService.updateTarefa(id, tarefaData);
      if (tarefaAtualizada) {
        setTarefas(prev => prev.map(tarefa => 
          tarefa.id === id ? tarefaAtualizada : tarefa
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erro ao atualizar tarefa');
      console.error('Erro ao atualizar tarefa:', err);
      return false;
    }
  };

  const deleteTarefa = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      const sucesso = await tarefaService.deleteTarefa(id);
      if (sucesso) {
        setTarefas(prev => prev.filter(tarefa => tarefa.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erro ao deletar tarefa');
      console.error('Erro ao deletar tarefa:', err);
      return false;
    }
  };

  const atribuirTarefas = async (idUsuario: number, idTarefas: number[]): Promise<boolean> => {
    setError(null);
    try {
      const sucesso = await tarefaService.atribuirTarefasAoUsuario(idUsuario, idTarefas);
      if (sucesso) {
        await loadTarefas(); // Recarregar para atualizar as atribuições
        return true;
      }
      return false;
    } catch (err) {
      setError('Erro ao atribuir tarefas');
      console.error('Erro ao atribuir tarefas:', err);
      return false;
    }
  };

  useEffect(() => {
    loadTarefas();
  }, [moradiaId]);

  return {
    tarefas,
    loading,
    error,
    loadTarefas,
    refreshTarefas: loadTarefas, // Alias para refresh
    createTarefa,
    updateTarefa,
    deleteTarefa,
    atribuirTarefas,
  };
};
