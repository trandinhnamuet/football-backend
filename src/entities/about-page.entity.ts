import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'about_page' })
export class AboutPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  banner_image_url: string;

  @Column({ type: 'text', default: '' })
  content_vi: string;

  @Column({ type: 'text', default: '' })
  content_en: string;

  @UpdateDateColumn()
  updated_at: Date;
}
