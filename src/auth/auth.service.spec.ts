import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockHistorialService: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'user-uuid' })),
      save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    mockHistorialService = {
      registrar: vi.fn().mockResolvedValue({ id: 'historial-uuid' }),
    };

    service = new AuthService(mockUserRepo, mockHistorialService);
  });

  describe('register', () => {
    it('debe lanzar ConflictException si el usuario ya existe', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });

      await expect(
        service.register({
          identificador_sistema: 'USR-001',
          password: 'secretpassword',
          device_id: 'device-abc',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe registrar el usuario con password hasheado y guardar evento REGISTRO_APK', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.register({
        identificador_sistema: 'USR-001',
        password: 'secretpassword',
        device_id: 'device-abc',
      });

      expect(result.success).toBe(true);
      expect(result.user.identificador_sistema).toBe('USR-001');
      expect((result.user as any).password).toBeUndefined();
      expect(mockHistorialService.registrar).toHaveBeenCalledWith(
        'user-uuid',
        'REGISTRO_APK',
        expect.objectContaining({ identificador_sistema: 'USR-001', device_id: 'device-abc' }),
      );
    });
  });

  describe('loginDevice', () => {
    it('debe lanzar UnauthorizedException si las credenciales son incorrectas', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.loginDevice({
          identificador_sistema: 'USR-001',
          password: 'wrong',
          device_id: 'device-abc',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el device_id no coincide (Device Binding)', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-uuid',
        identificador_sistema: 'USR-001',
        password: hashedPassword,
        device_id: 'device-original',
        is_active: true,
      });

      await expect(
        service.loginDevice({
          identificador_sistema: 'USR-001',
          password: 'secret123',
          device_id: 'device-impostor',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe vincular el nuevo device_id si el previo era null y permitir el login', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-uuid',
        identificador_sistema: 'USR-001',
        password: hashedPassword,
        device_id: null,
        is_active: true,
      });

      const result = await service.loginDevice({
        identificador_sistema: 'USR-001',
        password: 'secret123',
        device_id: 'device-nuevo',
      });

      expect(result.success).toBe(true);
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ device_id: 'device-nuevo' }),
      );
      expect(mockHistorialService.registrar).toHaveBeenCalledWith(
        'user-uuid',
        'LOGIN_APK',
        expect.objectContaining({ device_id: 'device-nuevo' }),
      );
    });
  });
});
