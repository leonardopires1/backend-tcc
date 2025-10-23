import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseInterceptors, UploadedFile, Res, StreamableFile, Request } from '@nestjs/common';
import { MoradiasService } from './moradias.service';
import { CreateMoradiaDto } from './dto/create-moradia.dto';
import { UpdateMoradiaDto } from './dto/update-moradia.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { Public } from 'src/common/decorators/user.decorator';

@Controller('moradias')
export class MoradiasController {
  constructor(private readonly moradiasService: MoradiasService) {}

  @Post()
  async create(@Body() createMoradiaDto: CreateMoradiaDto) {
    if (!createMoradiaDto.nome || !createMoradiaDto.CEP || !createMoradiaDto.donoId || !createMoradiaDto.valorMensalidade) {
      throw new HttpException('Nome, CEP, donoId e valorMensalidade são obrigatórios.', HttpStatus.BAD_REQUEST);
    }
    
    if (createMoradiaDto.valorMensalidade <= 0) {
      throw new HttpException('O valor da mensalidade deve ser maior que zero.', HttpStatus.BAD_REQUEST);
    }
    
    try {
      return await this.moradiasService.create(createMoradiaDto);
    } catch (error) {
      console.error('Erro ao criar moradia:', error);
      
      // Verifica se é erro de constraint de regras duplicadas
      if (error.message && error.message.includes('Unique constraint failed on the fields: (`moradiaId`,`regraId`)')) {
        throw new HttpException('Erro: Tentativa de adicionar regra duplicada à moradia.', HttpStatus.BAD_REQUEST);
      }
      
      // Verifica outros erros de constraint
      if (error.message && error.message.includes('Unique constraint failed')) {
        throw new HttpException('Erro: Violação de restrição única no banco de dados.', HttpStatus.BAD_REQUEST);
      }
      
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

  @Get('user')
  async findByUser(@Request() req: any) {
    try {
      // Extrair o userId do token JWT (assumindo que o middleware de auth já processou)
      const userId = req.user?.sub || req.user?.id;
      
      if (!userId) {
        throw new HttpException('Token de usuário inválido', HttpStatus.UNAUTHORIZED);
      }
      
      console.log(`[DEBUG] Buscando moradia para usuário ${userId}`);
      return await this.moradiasService.findByUser(+userId);
    } catch (error) {
      console.error(`[ERROR] Erro ao buscar moradia por usuário:`, error);
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

  @Public()
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
    console.log('📁 Upload de imagem recebido:', { 
      moradiaId, 
      filename: file?.filename, 
      originalName: file?.originalname,
      path: file?.path,
      size: file?.size 
    });
    
    try {
      if (!file) {
        throw new Error('Nenhum arquivo foi enviado');
      }

      // Salvar apenas o nome do arquivo (sem URL completa)
      const imagemFileName = file.filename;
      
      // Atualizar a moradia com o nome do arquivo da imagem
      const updateResult = await this.moradiasService.update(+moradiaId, { 
        imagemUrl: imagemFileName // Salvamos apenas o nome do arquivo
      });
      
      console.log('✅ Moradia atualizada com sucesso:', { 
        moradiaId, 
        imagemFileName, 
        filename: file.filename,
        originalPath: file.path 
      });
      
      return {
        success: true,
        imagePath: file.path,
        imagemFileName: imagemFileName,
        filename: file.filename,
        originalPath: file.path,
        message: 'Imagem enviada e moradia atualizada com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro no upload da imagem:', error);
      throw new HttpException(`Erro ao fazer upload da imagem: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Novo endpoint para servir a imagem diretamente
  @Public()
  @Get(':id/image')
  async getMoradiaImage(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    try {
      const moradia = await this.moradiasService.findOne(+id);
      
      if (!moradia.imagemUrl) {
        throw new HttpException('Moradia não possui imagem', HttpStatus.NOT_FOUND);
      }

      const imagePath = join(process.cwd(), 'images', 'moradias', moradia.imagemUrl);
      
      if (!existsSync(imagePath)) {
        throw new HttpException('Arquivo de imagem não encontrado', HttpStatus.NOT_FOUND);
      }

      const file = createReadStream(imagePath);
      
      // Definir o tipo de conteúdo baseado na extensão do arquivo
      const ext = moradia.imagemUrl.split('.').pop()?.toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      
      res.set({
        'Content-Type': mimeTypes[ext || 'jpg'] || 'image/jpeg',
        'Content-Disposition': `inline; filename="${moradia.imagemUrl}"`,
      });

      return new StreamableFile(file);
    } catch (error) {
      console.error(`❌ Erro ao buscar imagem da moradia ${id}:`, error);
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

  // Endpoint modificado para retornar informações da imagem
  @Get(':id/debug-image')
  async debugImage(@Param('id') id: string) {
    try {
      const moradia = await this.moradiasService.findOne(+id);
      const imagePath = moradia.imagemUrl ? join(process.cwd(), 'images', 'moradias', moradia.imagemUrl) : null;
      const imageExists = imagePath ? existsSync(imagePath) : false;
      
      return {
        moradiaId: id,
        imagemFileName: moradia.imagemUrl,
        hasImage: !!moradia.imagemUrl,
        imageExists: imageExists,
        imagePath: imagePath,
        imageEndpoint: moradia.imagemUrl ? `/moradias/${id}/image` : null,
        debug: 'Endpoint de debug para verificar arquivo de imagem'
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}

