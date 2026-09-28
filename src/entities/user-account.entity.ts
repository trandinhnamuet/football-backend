import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';

/**
 * Tài khoản đăng nhập của thành viên. Mỗi cầu thủ có một tài khoản, tự tạo
 * khi backend khởi động (mật khẩu mặc định, xem auth.service). Xoá cầu thủ thì
 * tài khoản đi theo (ON DELETE CASCADE).
 */
@Entity({ schema: 'football', name: 'user_accounts' })
export class UserAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, unique: true })
  player_id: number | null;

  @ManyToOne(() => Player, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  display_name: string | null;

  /** Còn dùng mật khẩu mặc định — nhắc người dùng đổi. */
  @Column({ type: 'boolean', default: true })
  is_default_password: boolean;

  /** Tăng mỗi lần đổi/reset mật khẩu để vô hiệu token cũ. */
  @Column({ type: 'int', default: 1 })
  password_version: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
