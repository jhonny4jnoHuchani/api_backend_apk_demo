import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokensService } from './tokens.service.js';
import { TokenEstado } from './entities/token.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('TokensService', () => {
  let service: TokensService;
  let mockTokenRepo: any;
  let mockUserRepo: any;
  let mockHistorialService: any;

  beforeEach(() => {
    mockTokenRepo = {
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      create: vi.fn().mockImplementation((dto) => ({
        ...dto,
        id: 'token-uuid',
        expira_en: new Date(Date.now() + 3600000),
      })),
      save: vi.fn().mockImplementation((token) => Promise.resolve(token)),
      findOne: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    mockHistorialService = {
      registrar: vi.fn().mockResolvedValue({ id: 'historial-uuid' }),
    };

    service = new TokensService(mockTokenRepo, mockUserRepo, mockHistorialService);
  });

  describe('generate', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.generate({ identificador_sistema: 'USR-999' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe invalidar tokens previos, generar un nuevo token de 6 dígitos y registrar en historial', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-uuid',
        identificador_sistema: 'USR-001',
        is_active: true,
      });

      const result = await service.generate({ identificador_sistema: 'USR-001' });

      expect(result.success).toBe(true);
      expect(result.codigo).toHaveLength(6);
      expect(mockTokenRepo.update).toHaveBeenCalledWith(
        { app_user_id: 'user-uuid', estado: TokenEstado.ACTIVO },
        { estado: TokenEstado.CADUCADO },
      );
      expect(mockHistorialService.registrar).toHaveBeenCalledWith(
        'user-uuid',
        'TOKEN_GENERADO',
        expect.objectContaining({ codigo: result.codigo }),
      );
    });
  });

  describe('validate', () => {
    it('debe responder { valid: false } si no se encuentra usuario', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.validate({
        identificador_sistema: 'NO_EXISTE',
        codigo: '123456',
      });

      expect(result.valid).toBe(false);
    });

    it('debe responder { valid: false } si no hay token activo', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-uuid' });
      mockTokenRepo.findOne.mockResolvedValue(null);

      const result = await service.validate({
        identificador_sistema: 'USR-001',
        codigo: '123456',
      });

      expect(result.valid).toBe(false);
    });

    it('debe responder { valid: false } y marcar caducado si el token expiró', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-uuid' });
      mockTokenRepo.findOne.mockResolvedValue({
        id: 'token-uuid',
        codigo: '123456',
        expira_en: new Date(Date.now() - 10000), // En el pasado
        estado: TokenEstado.ACTIVO,
      });

      const result = await service.validate({
        identificador_sistema: 'USR-001',
        codigo: '123456',
      });

      expect(result.valid).toBe(false);
      expect(mockTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: TokenEstado.CADUCADO }),
      );
    });

    it('debe responder { valid: false } si el código no coincide', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-uuid' });
      mockTokenRepo.findOne.mockResolvedValue({
        id: 'token-uuid',
        codigo: '999999',
        expira_en: new Date(Date.now() + 100000),
        estado: TokenEstado.ACTIVO,
      });

      const result = await service.validate({
        identificador_sistema: 'USR-001',
        codigo: '123456',
      });

      expect(result.valid).toBe(false);
    });

    it('debe responder { valid: true }, marcarlo usado y registrar en historial si es correcto', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-uuid' });
      mockTokenRepo.findOne.mockResolvedValue({
        id: 'token-uuid',
        codigo: '123456',
        expira_en: new Date(Date.now() + 100000),
        estado: TokenEstado.ACTIVO,
      });

      const result = await service.validate({
        identificador_sistema: 'USR-001',
        codigo: '123456',
      });

      expect(result.valid).toBe(true);
      expect(mockTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: TokenEstado.USADO }),
      );
      expect(mockHistorialService.registrar).toHaveBeenCalledWith(
        'user-uuid',
        'TOKEN_VALIDADO_SISTEMA',
        expect.objectContaining({ codigo: '123456' }),
      );
    });
  });
});
