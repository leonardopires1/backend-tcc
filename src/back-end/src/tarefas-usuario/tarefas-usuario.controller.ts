import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { TarefasUsuarioService } from './tarefas-usuario.service';
import { CreateTarefasUsuarioDto } from './dto/create-tarefas-usuario.dto';
import { UpdateTarefasUsuarioDto } from './dto/update-tarefas-usuario.dto';

@Controller('tarefas-usuario')
export class TarefasUsuarioController {
  constructor(private readonly tarefasUsuarioService: TarefasUsuarioService) {}

  @Post()
  create(@Body() createTarefasUsuarioDto: CreateTarefasUsuarioDto) {
    return this.tarefasUsuarioService.create(createTarefasUsuarioDto);
  }

  @Get()
  findAll() {
    return this.tarefasUsuarioService.findAll();
  }

  @Get('moradia/:moradiaId')
  findByMoradia(@Param('moradiaId') moradiaId: string) {
    return this.tarefasUsuarioService.findByMoradia(+moradiaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tarefasUsuarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTarefasUsuarioDto: UpdateTarefasUsuarioDto) {
    return this.tarefasUsuarioService.update(+id, updateTarefasUsuarioDto);
  }

  @Patch(':id/atribuir')
  atribuirAoUsuario(@Param('id') idUsuario: string, @Body() idTarefas: number[]) {
    return this.tarefasUsuarioService.atribuiAoUsuario(+idUsuario, idTarefas);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tarefasUsuarioService.remove(+id);
  }
}
