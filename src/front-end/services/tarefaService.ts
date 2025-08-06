import httpService from './httpService';
import { Tarefa, CreateTarefaDto, UpdateTarefaDto } from '../types/Tarefa';

class TarefaService {
  private baseEndpoint = '/tarefas-usuario';

  async getAllTarefas(): Promise<Tarefa[]> {
    const response = await httpService.get<Tarefa[]>(this.baseEndpoint, true, true);
    return response.data || [];
  }

  async getTarefaById(id: number): Promise<Tarefa | null> {
    const response = await httpService.get<Tarefa>(`${this.baseEndpoint}/${id}`, true, true);
    return response.data || null;
  }

  async createTarefa(tarefa: CreateTarefaDto): Promise<Tarefa | null> {
    const response = await httpService.post<Tarefa>(this.baseEndpoint, tarefa, true, true);
    return response.data || null;
  }

  async updateTarefa(id: number, tarefa: UpdateTarefaDto): Promise<Tarefa | null> {
    const response = await httpService.patch<Tarefa>(`${this.baseEndpoint}/${id}`, tarefa, true, true);
    return response.data || null;
  }

  async deleteTarefa(id: number): Promise<boolean> {
    const response = await httpService.delete(`${this.baseEndpoint}/${id}`, true, true);
    return response.ok;
  }

  async atribuirTarefasAoUsuario(idUsuario: number, idTarefas: number[]): Promise<boolean> {
    const response = await httpService.patch(
      `${this.baseEndpoint}/${idUsuario}/atribuir`,
      idTarefas,
      true,
      true
    );
    return response.ok;
  }
}

export default new TarefaService();
