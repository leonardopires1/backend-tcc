import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MoradiasService } from './moradias.service';
import { CreateMoradiaDto } from './dto/create-moradia.dto';
import { UpdateMoradiaDto } from './dto/update-moradia.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Observable } from 'rxjs';

@Controller('moradias')
export class MoradiasController {
  constructor(private readonly moradiasService: MoradiasService) {}

  @Post()
  async create(@Body() createMoradiaDto: CreateMoradiaDto) {
    if (!createMoradiaDto.nome || !createMoradiaDto.endereco || !createMoradiaDto.donoId || !createMoradiaDto.valorMensalidade) {
      throw new HttpException('Nome, endereço, donoId e valorMensalidade são obrigatórios.', HttpStatus.BAD_REQUEST);
    }
    
    if (createMoradiaDto.valorMensalidade <= 0) {
      throw new HttpException('O valor da mensalidade deve ser maior que zero.', HttpStatus.BAD_REQUEST);
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

  @Get('dono/:donoId')
  async findAllByDono(@Param('donoId') donoId: string) {
    try {
      const moradias = await this.moradiasService.findAllByDono(+donoId);
      console.log(`[DEBUG] Encontradas ${moradias.length} moradias para dono ${donoId}`);
      return moradias;
    } catch (error) {
      console.error(`[ERROR] Erro ao buscar moradias por dono ${donoId}:`, error);
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

  @Patch(':id/adicionar-membro/:usuarioId')
  async adicionarMembro(@Param('id') moradiaId: string, @Param('usuarioId') usuarioId: string): Promise<any> {
    try {
      return await this.moradiasService.adicionarMembro(+moradiaId, +usuarioId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/image-upload/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './images/moradias',
      filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const moradiaId: string = req.params.id;
        const fileName: string = `${file.originalname.split('.')[0]}_${moradiaId}.${file.originalname.split('.').pop()}`;
        cb(null, fileName);
      }
    })
  }))
  async uploadImage(@Param('id') moradiaId: string, @UploadedFile() file: Express.Multer.File) {
    try {
      // Atualizar a moradia com a URL da imagem
      const imagemUrl = file.path;
      await this.moradiasService.update(+moradiaId, { imagemUrl });
      
      return {
        success: true,
        imagePath: file.path,
        imagemUrl: imagemUrl,
        message: 'Imagem enviada e moradia atualizada com sucesso'
      };
    } catch (error) {
      throw new HttpException(`Erro ao fazer upload da imagem: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
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

