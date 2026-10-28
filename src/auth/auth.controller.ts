import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDeviceDto } from './dto/login-device.dto.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint 1: Auto-registro en el APK
   * POST /api/auth/register
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Endpoint 2: Login en el APK con validación estricta de Device Binding
   * POST /api/auth/login-device
   */
  @Post('login-device')
  @HttpCode(HttpStatus.OK)
  async loginDevice(@Body() loginDeviceDto: LoginDeviceDto) {
    return await this.authService.loginDevice(loginDeviceDto);
  }
}
