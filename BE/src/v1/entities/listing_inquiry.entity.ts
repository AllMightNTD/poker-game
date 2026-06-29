import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity('listing_inquiries')
export class ListingInquiry extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  listing_id: string;

  @Column({ type: 'varchar' })
  buyer_id: string;

  @Column({ type: 'varchar' })
  conversation_id: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Listing, (listing) => listing.inquiries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}
