import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_media')
export class ListingMedia extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  listing_id: string;

  @Column({ type: 'varchar', length: 1000 })
  file_url: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  // ---- Relations ----

  @ManyToOne(() => Listing, (listing) => listing.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;
}
