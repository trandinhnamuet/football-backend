import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Điểm danh trận + vận hành trận trực tiếp.
 *
 * attendance_logs: mỗi lần điểm danh / hủy điểm danh là một dòng (không ghi đè),
 * nên admin xem lại được ai làm gì lúc nào. Trạng thái hiện tại = dòng mới nhất
 * của từng cầu thủ trong trận.
 *
 * match_live_events: nhật ký sự kiện trận đang đá (bắt đầu/tạm dừng/kết thúc,
 * vào/ra sân, thay người, chuyền thành công). Thời gian thi đấu tính lại từ
 * nhật ký này nên nhiều máy cùng vận hành không ghi đè lẫn nhau. Hoàn tác =
 * đánh dấu voided_at, không xoá.
 */
export class CreateAttendanceAndLiveTables1715000000023 implements MigrationInterface {
  name = 'CreateAttendanceAndLiveTables1715000000023';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS football.attendance_logs (
        id SERIAL PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES football.players(id) ON DELETE CASCADE,
        action VARCHAR(16) NOT NULL,
        actor_user_id INTEGER NULL,
        actor_name VARCHAR(255) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS attendance_logs_match_idx ON football.attendance_logs (match_id, player_id, id)`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS football.match_live_events (
        id SERIAL PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES football.matches(id) ON DELETE CASCADE,
        type VARCHAR(16) NOT NULL,
        player_id INTEGER NULL REFERENCES football.players(id) ON DELETE SET NULL,
        player_out_id INTEGER NULL REFERENCES football.players(id) ON DELETE SET NULL,
        actor_user_id INTEGER NULL,
        actor_name VARCHAR(255) NULL,
        voided_at TIMESTAMPTZ NULL,
        voided_by VARCHAR(255) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS match_live_events_match_idx ON football.match_live_events (match_id, id)`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS football.match_live_events`);
    await q.query(`DROP TABLE IF EXISTS football.attendance_logs`);
  }
}
