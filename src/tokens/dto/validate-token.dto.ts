import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateTokenDto {
  @IsNotEmpty({ message: 'El identificador_sistema es obligatorio' })
  @IsString({ message: 'El identificador_sistema debe ser texto' })
  identificador_sistema: string;

  @IsNotEmpty({ message: 'El código es obligatorio' })
  @IsString({ message: 'El código debe ser texto' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  codigo: string;
}
