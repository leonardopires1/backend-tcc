import httpService from './httpService';
import API_CONFIG from '../config/apiConfig';
import { Tarefa, CreateTarefaDto, UpdateTarefaDto } from '../types/Tarefa';

class TarefaService {
  async getAllTarefas(): Promise<Tarefa[]> {
    const response = await httpService.get<Tarefa[]>(API_CONFIG.ENDPOINTS.TAREFAS.BASE, true, true);
    return response.data || [];
  }

  async getTarefasByMoradia(moradiaId: number): Promise<Tarefa[]> {
    const response = await httpService.get<Tarefa[]>(API_CONFIG.ENDPOINTS.TAREFAS.BY_MORADIA(moradiaId), true, true);
    return response.data || [];
  }

  async getTarefaById(id: number): Promise<Tarefa | null> {
    const response = await httpService.get<Tarefa>(API_CONFIG.ENDPOINTS.TAREFAS.BY_ID(id), true, true);
    return response.data || null;
  }

  async createTarefa(tarefa: CreateTarefaDto): Promise<Tarefa | null> {
    const response = await httpService.post<Tarefa>(API_CONFIG.ENDPOINTS.TAREFAS.BASE, tarefa, true, true);
    return response.data || null;
  }

  async updateTarefa(id: number, tarefa: UpdateTarefaDto): Promise<Tarefa | null> {
    const response = await httpService.patch<Tarefa>(API_CONFIG.ENDPOINTS.TAREFAS.BY_ID(id), tarefa, true, true);
    return response.data || null;
  }

  async deleteTarefa(id: number): Promise<boolean> {
    const response = await httpService.delete(API_CONFIG.ENDPOINTS.TAREFAS.BY_ID(id), true, true);
    return response.ok;
  }

  async atribuirTarefasAoUsuario(idUsuario: number, idTarefas: number[]): Promise<boolean> {
    const response = await httpService.patch(
      API_CONFIG.ENDPOINTS.TAREFAS.ATRIBUIR(idUsuario),
      idTarefas,
      true,
      true
    );
    return response.ok;
  }
}

export default new TarefaService();
