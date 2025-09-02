import { Injectable } from '@nestjs/common';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class DespesasService {

  constructor(private readonly prisma: PrismaService) {}

  create(createDespesaDto: CreateDespesaDto) {
    return this.prisma.despesa.create({
      data: {
        nome: createDespesaDto.titulo,
        valorTotal: createDespesaDto.valorTotal,
        vencimento: createDespesaDto.vencimento,
        tipo: createDespesaDto.tipo,
        moradia: {
          connect: { id: createDespesaDto.idMoradia }
        },
        usuarios: {
          connect: createDespesaDto.idsUsuarios.map(id => ({ id }))
        }
      },
    });
  }

  findAll() {
    return this.prisma.despesa.findMany();
  }

  findOne(id: number) {
    return this.prisma.despesa.findUnique({
      where: { id },
    });
  }

  findByMoradia(idMoradia: number) {
    return this.prisma.despesa.findMany({
      where: { moradiaId: idMoradia },
    });
  }

  update(id: number, updateDespesaDto: UpdateDespesaDto) {
    return this.prisma.despesa.update({
      where: { id },
      data: updateDespesaDto,
    });
  }

  remove(id: number) {
    return this.prisma.despesa.delete({
      where: { id },
    });
  }
}
