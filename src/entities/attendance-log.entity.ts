import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type AttendanceAction = 'checkin' | 'cancel';

/** Một lần điểm danh / hủy điểm danh của cầu thủ cho một trận (chỉ thêm, không sửa). */
@Entity({ schema: 'football', name: 'attendance_logs' })
export class AttendanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  match_id: number;

  @Column({ type: 'int' })
  player_id: number;

  @Column({ type: 'varchar', length: 16 })
  action: AttendanceAction;

  @Column({ type: 'int', nullable: true })
  actor_user_id: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actor_name: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
