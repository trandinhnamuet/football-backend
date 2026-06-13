import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'banner_slides' })
export class BannerSlide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  image_url: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  caption: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  caption_en: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  link_url: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
