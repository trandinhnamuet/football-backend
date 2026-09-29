import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Mã kết quả trận đấu: 'W' thắng, 'D' hòa, 'L' thua, 'S' chia đôi, 'C' hủy.
 * Chia đôi là trận nội bộ — đội tách làm hai bên đá với nhau — nên không có
 * thắng/hòa/thua và không tính vào hiệu số bàn thắng của đội.
 * Hủy là trận không đá được vì lý do bất khả kháng (thời tiết, sân, đối thủ bỏ
 * trận...): không có tỷ số và không tính vào bất cứ thống kê nào.
 */
export type MatchResult = 'W' | 'D' | 'L' | 'S' | 'C';

export const SPLIT_RESULT: MatchResult = 'S';
export const CANCELLED_RESULT: MatchResult = 'C';

@Entity({ schema: 'football', name: 'matches' })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  week: number;

  @Column()
  date: string;

  @Column()
  opponent: string;

  @Column({ nullable: true })
  venue: string;

  /** 'W' | 'D' | 'L' | 'S' (chia đôi) | 'C' (hủy). Rỗng khi chưa có kết quả. */
  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  score: string;

  @Column({ default: 0 })
  goals_for: number;

  @Column({ default: 0 })
  goals_against: number;

  @Column({ default: false })
  is_upcoming: boolean;

  @Column({ nullable: true })
  time: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  /** Loại sân: 5, 7 hoặc 11 người. */
  @Column({ type: 'int', default: 7 })
  pitch_size: number;

  /** Màu áo đội mặc trong trận, vd. "Cam" / "Đen". */
  @Column({ type: 'varchar', length: 100, nullable: true })
  kit_color: string | null;

  /** Màu áo thứ hai (mang dự phòng / đổi nếu trùng đối thủ). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  kit_color_2: string | null;

  @CreateDateColumn()
  created_at: Date;
}
