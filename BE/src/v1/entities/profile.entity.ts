import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gender, RelationshipStatus } from 'src/constants/enums';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  postcode: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  @Column({ type: 'enum', enum: RelationshipStatus, nullable: true })
  relationship_status: RelationshipStatus;

  @Column({ type: 'json', nullable: true })
  work: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  education: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  hobbies: string[];

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_music_id: string;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
