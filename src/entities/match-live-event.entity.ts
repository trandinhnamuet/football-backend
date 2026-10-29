import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * start/pause/resume/end: đồng hồ trận. in/out: một cầu thủ vào/ra sân.
 * sub: player_id vào thay player_out_id. pass: một đường chuyền thành công.
 */
export const LIVE_EVENT_TYPES = ['start', 'pause', 'resume', 'end', 'in', 'out', 'sub', 'pass'] as const;
export type LiveEventType = (typeof LIVE_EVENT_TYPES)[number];

/** Một sự kiện trong trận đang đá. Thời điểm lấy theo giờ server (created_at). */
@Entity({ schema: 'football', name: 'match_live_events' })
export class MatchLiveEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  match_id: number;

  @Column({ type: 'varchar', length: 16 })
  type: LiveEventType;

  @Column({ type: 'int', nullable: true })
  player_id: number | null;

  @Column({ type: 'int', nullable: true })
  player_out_id: number | null;

  @Column({ type: 'int', nullable: true })
  actor_user_id: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actor_name: string | null;

  /** Hoàn tác: đánh dấu thay vì xoá, để nhật ký vẫn còn dấu vết. */
  @Column({ type: 'timestamptz', nullable: true })
  voided_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  voided_by: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
