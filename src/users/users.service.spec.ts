import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service.js';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo: any;
  let mockHistorialService: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: vi.fn(),
      save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    mockHistorialService = {
      registrar: vi.fn().mockResolvedValue({ id: 'historial-uuid' }),
    };

    service = new UsersService(mockUserRepo, mockHistorialService);
  });

  describe('resetDevice', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.resetDevice({ identificador_sistema: 'USR-999' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe colocar device_id en null, guardar en bd y registrar DEVICE_RESET en historial', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-uuid',
        identificador_sistema: 'USR-001',
        device_id: 'device-antiguo',
      });

      const result = await service.resetDevice({ identificador_sistema: 'USR-001' });

      expect(result.success).toBe(true);
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ device_id: null }),
      );
      expect(mockHistorialService.registrar).toHaveBeenCalledWith(
        'user-uuid',
        'DEVICE_RESET',
        expect.objectContaining({
          identificador_sistema: 'USR-001',
          previo_device_id: 'device-antiguo',
        }),
      );
    });
  });
});
