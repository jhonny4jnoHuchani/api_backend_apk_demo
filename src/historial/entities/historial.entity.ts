import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { AppUser } from '../../users/entities/app-user.entity.js';

@Entity({ name: 'historial' })
@Index(['app_user_id', 'creado_en'])
export class Historial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'app_user_id',
    type: 'varchar',
    length: 36,
    comment: 'Identificador foráneo del usuario asociado al evento de auditoría',
  })
  app_user_id: string;

  @ManyToOne(() => AppUser, (appUser) => appUser.historiales, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'app_user_id' })
  appUser: Relation<AppUser>;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Acción realizada (ej: LOGIN_APK, TOKEN_GENERADO, TOKEN_VALIDADO)',
  })
  accion: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Detalles adicionales en texto o formato JSON del evento',
  })
  detalle: string | null;

  @CreateDateColumn({
    name: 'creado_en',
    type: 'timestamp',
  })
  creado_en: Date;
}
