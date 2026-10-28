import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
  type Relation,
} from 'typeorm';
import { AppUser } from '../../users/entities/app-user.entity.js';

export enum TokenEstado {
  ACTIVO = 'activo',
  USADO = 'usado',
  CADUCADO = 'caducado',
}

@Entity({ name: 'tokens' })
@Index(['app_user_id', 'estado'])
@Index(['codigo', 'estado'])
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'app_user_id',
    type: 'varchar',
    length: 36,
    comment: 'Identificador foráneo del usuario dueño del token',
  })
  app_user_id: string;

  @ManyToOne(() => AppUser, (appUser) => appUser.tokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'app_user_id' })
  appUser: Relation<AppUser>;

  @Column({
    type: 'varchar',
    length: 6,
    comment: 'Código numérico de 6 dígitos para validación',
  })
  codigo: string;

  @CreateDateColumn({
    name: 'creado_en',
    type: 'timestamp',
  })
  creado_en: Date;

  @Column({
    name: 'expira_en',
    type: 'timestamp',
    comment: 'Momento exacto en que expira el token (1 hora tras su emisión)',
  })
  expira_en: Date;

  @Column({
    type: 'enum',
    enum: TokenEstado,
    default: TokenEstado.ACTIVO,
    comment: 'Estado del ciclo de vida del token',
  })
  estado: TokenEstado;

  @BeforeInsert()
  calcularExpiracion() {
    if (!this.expira_en) {
      // 1 hora de validez exacta (3600 * 1000 ms)
      this.expira_en = new Date(Date.now() + 60 * 60 * 1000);
    }
  }
}
