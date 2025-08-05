import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateMoradiaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsNumber()
  donoId: number;

  @IsOptional()
  @IsArray()
  moradoresIds?: number[];

  @IsOptional()
  @IsArray()
  tarefas?: {
    nome: string;
    descricao?: string;
    recorrencia: string;
  }[];

  @IsOptional()
  @IsArray()
  despesas?: {
    nome: string;
    valorTotal: number;
    vencimento: Date;
    tipo?: string;
  }[];

  @IsOptional()
  regras?: {
    id: number[];
  };

  @IsOptional()
  @IsArray()
  comodidades?: {
    nome: string;
    descricao?: string;
  }[];
}
