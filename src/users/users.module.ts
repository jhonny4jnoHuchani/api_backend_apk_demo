import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUser } from './entities/app-user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { HistorialModule } from '../historial/historial.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([AppUser]), HistorialModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
