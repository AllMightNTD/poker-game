import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PokerTable } from './poker_table.entity';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['event_type'])
@Index(['user_id'])
@Index(['room_id'])
@Index(['created_at'])
export class AuditLog extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Loại sự kiện
     * VD:
     * CHEAT_DETECTED
     * PLAYER_BANNED
     * PLAYER_LEAVE
     * PLAYER_JOIN
     * WALLET_UPDATE
     * ADMIN_ACTION
     */
    @Column({
        type: 'varchar',
        length: 50,
    })
    event_type: string;

    /**
     * User liên quan
     */
    @Column({
        nullable: true,
    })
    user_id?: string;

    /**
     * Room liên quan
     */
    @Column({
        nullable: true,
    })
    room_id?: string;

    /**
     * Mô tả ngắn
     */
    @Column({
        type: 'text',
    })
    description: string;

    /**
     * Mức độ nghiêm trọng
     */
    @Column({
        type: 'enum',
        enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        default: 'INFO',
    })
    level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

    /**
     * Metadata chi tiết
     */
    @Column({
        type: 'json',
        nullable: true,
    })
    metadata?: Record<string, any>;

    /**
     * IP client
     */
    @Column({
        nullable: true,
    })
    ip_address?: string;

    /**
     * User Agent
     */
    @Column({
        nullable: true,
        type: 'text',
    })
    user_agent?: string;

    @ManyToOne(() => User, (user) => user.auditLog)
    user: User;

    @ManyToOne(() => PokerTable, (room) => room.auditLog)
    room: PokerTable;

    /**
     * Ai thực hiện hành động
     * (Admin hoặc chính user)
     */
    @Column({
        nullable: true,
    })
    actor_id?: string;

    @ManyToOne(() => User, (user) => user.auditLog)
    actor: User;

    /**
     * Thời gian
     */
    @CreateDateColumn()
    created_at: Date;
}
