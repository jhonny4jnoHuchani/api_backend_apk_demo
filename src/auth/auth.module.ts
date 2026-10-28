import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AppUser } from '../users/entities/app-user.entity.js';
import { HistorialModule } from '../historial/historial.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([AppUser]), HistorialModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
