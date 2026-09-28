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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
