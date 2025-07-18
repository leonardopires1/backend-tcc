import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RegraMoradiaService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.regras.findMany({
      select: {
        id: true,
        titulo: true,
        descricao: true,
      },
    });
  }

  findUnique(id: number) {
    return this.prisma.regras.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descricao: true,
      },
    });
  }

  registerRegraMoradia(idMoradia: number, idRegra: number[]) {
    return this.prisma.regrasMoradia.createMany({
      data: idRegra.map((regraId) => ({
        moradiaId: idMoradia,
        regraId: regraId,
      })),
    });
  }

  deleteRegraMoradia(idMoradia: number, idRegra: number) {
    return this.prisma.regrasMoradia.deleteMany({
      where: {
        moradiaId: idMoradia,
        regraId: idRegra,
      },
    });
  }

  deleteRegraMoradiaByMoradiaId(idMoradia: number) {
    return this.prisma.regrasMoradia.deleteMany({
      where: {
        moradiaId: idMoradia,
      },
    });
  }
}
