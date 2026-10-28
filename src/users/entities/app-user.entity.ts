import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  type Relation,
} from 'typeorm';
import { Token } from '../../tokens/entities/token.entity.js';
import { Historial } from '../../historial/entities/historial.entity.js';

@Entity({ name: 'app_users' })
export class AppUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({
    name: 'identificador_sistema',
    type: 'varchar',
    length: 100,
    comment: 'ID o identificador único del usuario en el sistema principal externo',
  })
  identificador_sistema: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Hash de la contraseña para inicio de sesión en la app móvil',
  })
  password: string;

  @Index()
  @Column({
    name: 'device_id',
    type: 'varchar',
    length: 150,
    nullable: true,
    comment: 'UUID único del hardware del dispositivo móvil (Device Binding)',
  })
  device_id: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'Estado de habilitación del usuario en la app móvil',
  })
  is_active: boolean;

  @CreateDateColumn({
    name: 'creado_en',
    type: 'timestamp',
  })
  creado_en: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamp',
  })
  actualizado_en: Date;

  @OneToMany(() => Token, (token) => token.appUser)
  tokens: Relation<Token[]>;

  @OneToMany(() => Historial, (historial) => historial.appUser)
  historiales: Relation<Historial[]>;
}
