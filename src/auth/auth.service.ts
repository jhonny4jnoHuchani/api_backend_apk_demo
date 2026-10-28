import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppUser } from '../users/entities/app-user.entity.js';
import { HistorialService } from '../historial/historial.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDeviceDto } from './dto/login-device.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppUser)
    private readonly userRepository: Repository<AppUser>,
    private readonly historialService: HistorialService,
  ) {}

  /**
   * Auto-registro de usuario desde la aplicación móvil (APK)
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { identificador_sistema: dto.identificador_sistema },
    });

    if (existingUser) {
      throw new ConflictException(
        `El usuario con identificador '${dto.identificador_sistema}' ya se encuentra registrado`,
      );
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Crear la entidad
    const newUser = this.userRepository.create({
      identificador_sistema: dto.identificador_sistema,
      password: hashedPassword,
      device_id: dto.device_id,
      is_active: true,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Registrar evento en auditoría
    await this.historialService.registrar(savedUser.id, 'REGISTRO_APK', {
      identificador_sistema: savedUser.identificador_sistema,
      device_id: dto.device_id,
    });

    // Excluir contraseña de la respuesta
    const { password: _password, ...usuarioSinPassword } = savedUser;

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: usuarioSinPassword,
    };
  }

  /**
   * Inicio de sesión desde el APK con validación estricta de Device Binding
   */
  async loginDevice(dto: LoginDeviceDto) {
    const user = await this.userRepository.findOne({
      where: { identificador_sistema: dto.identificador_sistema },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas o usuario no registrado');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva');
    }

    // Verificar hash de contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar Device Binding
    if (user.device_id === null) {
      // Si el device_id fue reseteado por el admin, vincular el nuevo dispositivo
      user.device_id = dto.device_id;
      await this.userRepository.save(user);
      await this.historialService.registrar(user.id, 'DEVICE_VINCULADO', {
        device_id: dto.device_id,
      });
    } else if (user.device_id !== dto.device_id) {
      // Dispositivo no coincide
      throw new UnauthorizedException(
        'Acceso denegado: este dispositivo no coincide con el teléfono vinculado a la cuenta (Device Binding)',
      );
    }

    // Registrar login exitoso en historial
    await this.historialService.registrar(user.id, 'LOGIN_APK', {
      device_id: dto.device_id,
    });

    const { password: _password, ...usuarioSinPassword } = user;

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      user: usuarioSinPassword,
    };
  }
}
