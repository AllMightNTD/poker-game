import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToOne
} from 'typeorm';
import { UserSettings } from './user_settings.entity';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    user_name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar_url: string;

    @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE', 'BANNED'], default: 'ACTIVE' })
    status: string;

    @Column({ type: 'boolean', default: false })
    is_active_status: boolean;

    @OneToOne(() => UserSettings, (settings) => settings.user)
    settings: UserSettings;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
