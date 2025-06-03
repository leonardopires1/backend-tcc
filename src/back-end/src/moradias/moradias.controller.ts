import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MoradiasService } from './moradias.service';
import { CreateMoradiaDto } from './dto/create-moradia.dto';
import { UpdateMoradiaDto } from './dto/update-moradia.dto';

@Controller('moradias')
export class MoradiasController {
  constructor(private readonly moradiasService: MoradiasService) {}

  @Post()
  async create(@Body() createMoradiaDto: CreateMoradiaDto) {
    if (!createMoradiaDto.nome || !createMoradiaDto.endereco || !createMoradiaDto.donoId) {
      throw new HttpException('Nome, endereço e donoId são obrigatórios.', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.moradiasService.create(createMoradiaDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.moradiasService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.moradiasService.findOne(+id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMoradiaDto: UpdateMoradiaDto) {
    try {
      return await this.moradiasService.update(+id, updateMoradiaDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.moradiasService.remove(+id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
