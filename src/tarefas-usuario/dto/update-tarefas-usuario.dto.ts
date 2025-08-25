import { PartialType } from '@nestjs/swagger';
import { CreateTarefasUsuarioDto } from './create-tarefas-usuario.dto';

export class UpdateTarefasUsuarioDto extends PartialType(CreateTarefasUsuarioDto) {}
