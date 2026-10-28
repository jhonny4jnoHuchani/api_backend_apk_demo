import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity.js';
import { AppUser } from '../users/entities/app-user.entity.js';
import { TokensController } from './tokens.controller.js';
import { TokensService } from './tokens.service.js';
import { HistorialModule } from '../historial/historial.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Token, AppUser]), HistorialModule],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService, TypeOrmModule],
})
export class TokensModule {}
