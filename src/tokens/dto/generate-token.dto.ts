import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTokenDto {
  @IsNotEmpty({ message: 'El identificador_sistema es obligatorio' })
  @IsString({ message: 'El identificador_sistema debe ser texto' })
  identificador_sistema: string;
}
