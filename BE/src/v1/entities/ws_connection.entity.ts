import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { DeviceType } from 'src/constants/enums';
import { User } from './user.entity';

@Entity('ws_connections')
export class WsConnection extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  socket_id: string;

  @Column({ type: 'varchar', length: 255 })
  server_id: string;

  @Column({ type: 'enum', enum: DeviceType })
  device_type: DeviceType;

  @Column({ type: 'datetime' })
  last_ping_at: Date;

  @Column({ type: 'datetime' })
  connected_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
