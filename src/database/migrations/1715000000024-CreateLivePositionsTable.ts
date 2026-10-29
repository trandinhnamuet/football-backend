import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Vị trí của cầu thủ trên sơ đồ sân trong trận đang đá (kéo thả ở trang vận
 * hành trận). x, y là tỉ lệ 0..1 theo bề ngang / bề dọc sân, y = 1 là khung
 * thành nhà. Mỗi cầu thủ một dòng mỗi trận — trạng thái, không phải lịch sử.
 */
export class CreateLivePositionsTable1715000000024 implements MigrationInterface {
  name = 'CreateLivePositionsTable1715000000024';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS football.match_live_positions (
        match_id INTEGER NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES football.players(id) ON DELETE CASCADE,
        x REAL NOT NULL,
        y REAL NOT NULL,
        updated_by VARCHAR(255) NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (match_id, player_id)
      )
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS football.match_live_positions`);
  }
}
