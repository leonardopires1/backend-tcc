import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, CurrentUser } from '../common/decorators/user.decorator';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email, CPF ou telefone já existem' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: [
        {
          id: 1,
          nome: 'João Silva',
          email: 'joao@email.com',
        }
      ]
    }
  })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@CurrentUser() user: any) {
    return await this.usersService.findOne(user.email);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Buscar usuário por CPF' })
  @ApiParam({ name: 'cpf', description: 'CPF do usuário (apenas números)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findByCpf(@Param('cpf') cpf: string) {
    return await this.usersService.findByCpf(cpf);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Buscar usuário por email' })
  @ApiParam({ name: 'email', description: 'Email do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('email') email: string) {
    return await this.usersService.findOne(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Post('/upload-avatar/:id')
  @ApiOperation({ summary: 'Upload de avatar do usuário' })
  @ApiResponse({ status: 200, description: 'Avatar do usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './images/avatars',
      filename: (req, file, cb) => {
        const userId = req.params.id;
        const fileName = `avatar_${userId}_${Date.now()}.${file.originalname.split('.').pop()}`;
        cb(null, fileName);
      }
    })
  }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Param('id') id: string) {
    console.log('📁 Upload de avatar recebido:', { 
      userId: id, 
      filename: file?.filename, 
      originalName: file?.originalname,
      path: file?.path,
      size: file?.size 
    });

    try {
      if (!file) {
        throw new HttpException('Arquivo não enviado', HttpStatus.BAD_REQUEST);
      }

      // Salvar apenas o nome do arquivo (sem URL completa)
      const avatarFileName = file.filename;

      // Atualizar o usuário com o nome do arquivo do avatar
      const updatedUser = await this.usersService.updateAvatar(id, avatarFileName);

      console.log('✅ Avatar do usuário atualizado com sucesso:', { 
        userId: id, 
        avatarFileName, 
        filename: file.filename,
        updatedUser
      });

      return {
        success: true,
        avatarFileName: avatarFileName,
        filename: file.filename,
        user: updatedUser,
        message: 'Avatar enviado e usuário atualizado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro no upload do avatar:', error);
      
      // Tratamento mais específico de erros
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (error.code === 'P2002') {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
      
      if (error.code === 'P2025') {
        throw new HttpException('Usuário não encontrado para atualização', HttpStatus.NOT_FOUND);
      }
      
      const errorMessage = error.message || 'Erro interno do servidor';
      throw new HttpException(`Erro ao fazer upload do avatar: ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Novo endpoint para servir o avatar diretamente
  @Get(':id/avatar')
  @ApiOperation({ summary: 'Obter avatar do usuário' })
  @ApiResponse({ status: 200, description: 'Avatar do usuário' })
  @ApiResponse({ status: 404, description: 'Avatar não encontrado' })
  async getUserAvatar(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    try {
      const user = await this.usersService.findOneById(+id);
      
      if (!user.avatarUrl) {
        throw new HttpException('Usuário não possui avatar', HttpStatus.NOT_FOUND);
      }

      const avatarPath = join(process.cwd(), 'images', 'avatars', user.avatarUrl);
      
      if (!existsSync(avatarPath)) {
        throw new HttpException('Arquivo de avatar não encontrado', HttpStatus.NOT_FOUND);
      }

      const file = createReadStream(avatarPath);
      
      // Definir o tipo de conteúdo baseado na extensão do arquivo
      const ext = user.avatarUrl.split('.').pop()?.toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      
      res.set({
        'Content-Type': mimeTypes[ext || 'jpg'] || 'image/jpeg',
        'Content-Disposition': `inline; filename="${user.avatarUrl}"`,
      });

      return new StreamableFile(file);
    } catch (error) {
      console.error(`❌ Erro ao buscar avatar do usuário ${id}:`, error);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
