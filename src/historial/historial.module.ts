import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Historial } from './entities/historial.entity.js';
import { HistorialService } from './historial.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Historial])],
  providers: [HistorialService],
  exports: [HistorialService, TypeOrmModule],
})
export class HistorialModule {}
