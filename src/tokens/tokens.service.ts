import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'node:crypto';
import { Token, TokenEstado } from './entities/token.entity.js';
import { AppUser } from '../users/entities/app-user.entity.js';
import { HistorialService } from '../historial/historial.service.js';
import { GenerateTokenDto } from './dto/generate-token.dto.js';
import { ValidateTokenDto } from './dto/validate-token.dto.js';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(AppUser)
    private readonly userRepository: Repository<AppUser>,
    private readonly historialService: HistorialService,
  ) {}

  /**
   * Endpoint 3: Generar Token OTP de 6 dígitos para la App Móvil
   */
  async generate(dto: GenerateTokenDto) {
    const user = await this.userRepository.findOne({
      where: { identificador_sistema: dto.identificador_sistema },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con identificador '${dto.identificador_sistema}' no encontrado`,
      );
    }

    if (!user.is_active) {
      throw new BadRequestException('El usuario se encuentra inactivo');
    }

    // Invalidar cualquier token activo previo (marcar como caducado)
    await this.tokenRepository.update(
      { app_user_id: user.id, estado: TokenEstado.ACTIVO },
      { estado: TokenEstado.CADUCADO },
    );

    // Generar código numérico aleatorio de 6 dígitos criptográficamente seguro (100000 - 999999)
    const codigo = randomInt(100000, 1000000).toString();

    // Crear el nuevo token
    const token = this.tokenRepository.create({
      app_user_id: user.id,
      codigo,
      estado: TokenEstado.ACTIVO,
    });

    const savedToken = await this.tokenRepository.save(token);

    // Registrar en auditoría
    await this.historialService.registrar(user.id, 'TOKEN_GENERADO', {
      codigo: savedToken.codigo,
      expira_en: savedToken.expira_en,
    });

    return {
      success: true,
      codigo: savedToken.codigo,
      expira_en: savedToken.expira_en,
      estado: savedToken.estado,
    };
  }

  /**
   * Endpoint 4: Validar Token OTP (consumido desde el sistema principal / Laravel)
   */
  async validate(dto: ValidateTokenDto): Promise<{ valid: boolean; message?: string }> {
    const user = await this.userRepository.findOne({
      where: { identificador_sistema: dto.identificador_sistema },
    });

    if (!user) {
      return { valid: false, message: 'Usuario no encontrado' };
    }

    // Buscar el token más reciente en estado 'activo'
    const token = await this.tokenRepository.findOne({
      where: {
        app_user_id: user.id,
        estado: TokenEstado.ACTIVO,
      },
      order: { creado_en: 'DESC' },
    });

    if (!token) {
      return { valid: false, message: 'No existe un token activo para este usuario' };
    }

    const ahora = new Date();

    // Verificar si el token ya expiró
    if (token.expira_en <= ahora) {
      token.estado = TokenEstado.CADUCADO;
      await this.tokenRepository.save(token);
      return { valid: false, message: 'El token ha expirado' };
    }

    // Verificar coincidencia de código de 6 dígitos
    if (token.codigo !== dto.codigo) {
      return { valid: false, message: 'El código proporcionado no coincide' };
    }

    // Marcar token como USADO
    token.estado = TokenEstado.USADO;
    await this.tokenRepository.save(token);

    // Registrar evento de validación exitosa en historial
    await this.historialService.registrar(user.id, 'TOKEN_VALIDADO_SISTEMA', {
      codigo: dto.codigo,
      fecha_validacion: ahora,
    });

    return { valid: true, message: 'Token validado correctamente' };
  }
}
