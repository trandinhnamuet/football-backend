import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/** Vị trí cầu thủ trên sơ đồ sân của trận đang đá; x, y là tỉ lệ 0..1 (y = 1 là khung thành nhà). */
@Entity({ schema: 'football', name: 'match_live_positions' })
export class MatchLivePosition {
  @PrimaryColumn({ type: 'int' })
  match_id: number;

  @PrimaryColumn({ type: 'int' })
  player_id: number;

  @Column({ type: 'real' })
  x: number;

  @Column({ type: 'real' })
  y: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
