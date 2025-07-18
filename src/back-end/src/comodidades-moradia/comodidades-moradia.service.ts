import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ComodidadesMoradiaService {
    constructor(private readonly prisma: PrismaService) {} // Assuming prisma is injected

    async findMany(moradiaId: number) {
        return await this.prisma.comodidades.findMany({
            where: {
                moradiaId: moradiaId
            }
        });
    }

    async addComodidadeToMoradia(moradiaId: number, { nome, descricao }: { nome: string; descricao: string }) {
        
        return await this.prisma.comodidades.create({
            data: {
                nome: nome,
                moradiaId: moradiaId,
                descricao: descricao
            }
        });
    }

    async removeComodidadeFromMoradia(comodidadeId: number) {
        return await this.prisma.comodidades.delete({
            where: {
                id: comodidadeId
            }
        });
    }

    async removeComodidadeFromMoradiaByMoradiaId(moradiaId: number) {
        return await this.prisma.comodidades.deleteMany({
            where: {
                moradiaId: moradiaId
            }
        });
    }
}
