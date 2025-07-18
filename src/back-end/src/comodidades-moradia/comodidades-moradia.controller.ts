import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ComodidadesMoradiaService } from './comodidades-moradia.service';
import { Body, Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { CreateComodidadeDto } from './dto/comodidades-moradia-dto';

@Controller('comodidades-moradia')
export class ComodidadesMoradiaController {
    constructor(private readonly comodidadesMoradiaService: ComodidadesMoradiaService) {}

    @Get('/comodidades/:idMoradia')
    async findManyComodidadesByMoradiaId(@Param('idMoradia') idMoradia: number) {
        return await this.comodidadesMoradiaService.findMany(idMoradia);
    }

    @Post('/comodidades/:idMoradia')
    async addComodidadeToMoradia(@Param('idMoradia') idMoradia: number, @Body() createComodidadeDto: CreateComodidadeDto) {
        return await this.comodidadesMoradiaService.addComodidadeToMoradia(idMoradia, { nome: createComodidadeDto.nome, descricao: createComodidadeDto.descricao || '' });
    }

    @Delete('/comodidades/:idComodidade')
    async removeComodidadeFromMoradia(@Param('idComodidade') idComodidade: number) {
        return await this.comodidadesMoradiaService.removeComodidadeFromMoradia(idComodidade);
    }
}
