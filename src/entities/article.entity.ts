import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'articles' })
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  /** Đường dẫn SEO /news/<slug>, sinh từ tiêu đề và giữ nguyên khi sửa tiêu đề. */
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  slug: string | null;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  published_at: Date;

  /** Thông báo quan trọng — chỉ một bài được bật tại một thời điểm. */
  @Column({ type: 'boolean', default: false })
  is_important: boolean;

  /** Ngày cuối còn quan trọng (YYYY-MM-DD). NULL = không hẹn giờ. */
  @Column({ type: 'date', nullable: true })
  important_until: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
