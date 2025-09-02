import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DespesasService } from './despesas.service';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';

@Controller('despesas')
export class DespesasController {
  constructor(private readonly despesasService: DespesasService) {}

  @Post()
  create(@Body() createDespesaDto: CreateDespesaDto) {
    return this.despesasService.create(createDespesaDto);
  }

  @Get()
  findAll() {
    return this.despesasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.despesasService.findOne(+id);
  }

  @Get('moradia/:id')
  findByMoradia(@Param('id') id: string) {
    return this.despesasService.findByMoradia(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDespesaDto: UpdateDespesaDto) {
    return this.despesasService.update(+id, updateDespesaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.despesasService.remove(+id);
  }
}
