import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './entities/historial.entity.js';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,
  ) {}

  /**
   * Registra una acción de auditoría en la tabla 'historial'
   * @param appUserId ID del usuario en app_users (UUID)
   * @param accion Identificador de la acción (ej: REGISTRO_APK, LOGIN_APK, TOKEN_GENERADO, etc.)
   * @param detalle Información adicional en formato texto o JSON serializable
   */
  async registrar(
    appUserId: string,
    accion: string,
    detalle?: string | Record<string, any> | null,
  ): Promise<Historial> {
    const detalleStr =
      detalle == null
        ? null
        : typeof detalle === 'string'
          ? detalle
          : JSON.stringify(detalle);

    const log = this.historialRepository.create({
      app_user_id: appUserId,
      accion,
      detalle: detalleStr,
    });

    return await this.historialRepository.save(log);
  }

  /**
   * Consulta los registros de historial de un usuario
   */
  async listarPorUsuario(appUserId: string): Promise<Historial[]> {
    return await this.historialRepository.find({
      where: { app_user_id: appUserId },
      order: { creado_en: 'DESC' },
    });
  }
}
