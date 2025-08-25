import { Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { RegraMoradiaService } from './regra-moradia.service';

@Controller('regras-moradia')
export class RegrasMoradiaController {
    constructor(private readonly regraMoradiaService: RegraMoradiaService) {}

    @Get('getAll')
    async findAll() {
        return await this.regraMoradiaService.findAll();
    }

    @Get('getUnique/:id')
    async findUnique(@Param('id') id: number) {
        return await this.regraMoradiaService.findUnique(id);
    }

    @Post('register/:idMoradia/:idRegra')
    async registerRegraMoradia(@Param('idMoradia') idMoradia: number, @Param('idRegra') idRegra: number) {
        return await this.regraMoradiaService.registerRegraMoradia(idMoradia, [idRegra]);
    }

        @Get('moradia/:idMoradia')
        async getRegrasByMoradia(@Param('idMoradia') idMoradia: number) {
            return await this.regraMoradiaService.findByMoradia(idMoradia);
        }

        @Delete('register/:idMoradia/:idRegra')
        async unlinkRegraMoradia(@Param('idMoradia') idMoradia: number, @Param('idRegra') idRegra: number) {
            return await this.regraMoradiaService.deleteRegraMoradia(idMoradia, idRegra);
        }
}
