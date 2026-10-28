import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El identificador_sistema es obligatorio' })
  @IsString({ message: 'El identificador_sistema debe ser texto' })
  identificador_sistema: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El device_id es obligatorio' })
  @IsString({ message: 'El device_id debe ser texto' })
  device_id: string;
}
