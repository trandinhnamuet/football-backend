import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Tin tuyển quân: đội thiếu người ở vị trí nào thì admin đăng một tin ở đây
 * (ví dụ "Tuyển thủ môn"). Tin có thể đóng tay (is_open = false) hoặc tự hết
 * hạn theo expires_at.
 */
@Entity({ schema: 'football', name: 'recruitment_posts' })
export class RecruitmentPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_en: string;

  /** GK | DEF | MID | FWD | ANY */
  @Column({ type: 'varchar', length: 20, default: 'ANY' })
  position: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
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
  contact_name: string;

  @Column({ nullable: true })
  contact_phone: string;

  /** Link Zalo / Facebook / Messenger để ứng viên nhắn tin. */
  @Column({ nullable: true })
  contact_link: string;

  @Column({ type: 'boolean', default: true })
  is_open: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
