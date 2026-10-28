import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from './entities/app-user.entity.js';
import { HistorialService } from '../historial/historial.service.js';
import { ResetDeviceDto } from './dto/reset-device.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(AppUser)
    private readonly userRepository: Repository<AppUser>,
    private readonly historialService: HistorialService,
  ) {}

  /**
   * Endpoint 5: Desvincular / Resetear el device_id de un usuario (para el Admin de Laravel)
   * Permite que en su próximo login/registro pueda vincular un nuevo equipo
   */
  async resetDevice(dto: ResetDeviceDto) {
    const user = await this.userRepository.findOne({
      where: { identificador_sistema: dto.identificador_sistema },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con identificador '${dto.identificador_sistema}' no encontrado`,
      );
    }

    const previoDeviceId = user.device_id;
    user.device_id = null;
    await this.userRepository.save(user);

    // Registrar en auditoría
    await this.historialService.registrar(user.id, 'DEVICE_RESET', {
      identificador_sistema: user.identificador_sistema,
      previo_device_id: previoDeviceId,
    });

    return {
      success: true,
      message: 'Dispositivo desvinculado exitosamente. El usuario puede asociar un nuevo equipo.',
    };
  }

  /**
   * Buscar usuario por identificador de sistema
   */
  async findByIdentificador(identificador_sistema: string) {
    const user = await this.userRepository.findOne({
      where: { identificador_sistema },
    });
    if (!user) {
      throw new NotFoundException(`Usuario '${identificador_sistema}' no encontrado`);
    }
    const { password: _password, ...usuarioSinPassword } = user;
    return usuarioSinPassword;
  }
}
