import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ResetDeviceDto } from './dto/reset-device.dto.js';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint 5: Resetear device_id (Para el Admin de Laravel)
   * POST /api/users/reset-device
   */
  @Post('reset-device')
  @HttpCode(HttpStatus.OK)
  async resetDevice(@Body() resetDeviceDto: ResetDeviceDto) {
    return await this.usersService.resetDevice(resetDeviceDto);
  }
}
