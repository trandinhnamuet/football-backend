import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** Thông báo ngắn trên trang chủ — ảnh + đoạn text, không có trang chi tiết. */
@Entity({ schema: 'football', name: 'announcements' })
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  image_url: string;

  @Column({ type: 'text', default: '' })
  text: string;

  @Column({ type: 'text', default: '' })
  text_en: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
