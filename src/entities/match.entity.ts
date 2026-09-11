import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Mã kết quả trận đấu: 'W' thắng, 'D' hòa, 'L' thua, 'S' chia đôi.
 * Chia đôi là trận nội bộ — đội tách làm hai bên đá với nhau — nên không có
 * thắng/hòa/thua và không tính vào hiệu số bàn thắng của đội.
 */
export type MatchResult = 'W' | 'D' | 'L' | 'S';

export const SPLIT_RESULT: MatchResult = 'S';

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

  /** 'W' | 'D' | 'L' | 'S' (chia đôi). Rỗng khi chưa có kết quả. */
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

  @CreateDateColumn()
  created_at: Date;
}
