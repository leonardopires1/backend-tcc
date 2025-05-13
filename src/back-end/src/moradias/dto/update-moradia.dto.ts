import { PartialType } from '@nestjs/mapped-types';
import { CreateMoradiaDto } from './create-moradia.dto';

export class UpdateMoradiaDto extends PartialType(CreateMoradiaDto) {}
