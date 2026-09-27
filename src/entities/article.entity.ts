import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'articles' })
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_en: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  content_en: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  excerpt_en: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  tag_en: string;

  /** 'news' (tin tức, lưu trữ lâu dài) | 'announcement' (thông báo, có hạn). */
  @Column({ type: 'varchar', length: 20, default: 'news' })
  kind: string;

  /** Thông báo ghim luôn đứng đầu khối thông báo. */
  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  /** Hết ngày này thông báo tự rút khỏi trang chủ (null = không hạn). */
  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
