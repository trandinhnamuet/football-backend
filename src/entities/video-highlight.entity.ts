import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'video_highlights' })
export class VideoHighlight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  youtube_url: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  title: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  title_en: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 500, default: 'https://www.youtube.com/@fclonfanta' })
  channel_url: string;

  @UpdateDateColumn()
  updated_at: Date;
}
