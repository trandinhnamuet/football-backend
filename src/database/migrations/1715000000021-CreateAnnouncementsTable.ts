import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnnouncementsTable1715000000021 implements MigrationInterface {
  name = 'CreateAnnouncementsTable1715000000021';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Thông báo ngắn trên trang chủ: một ảnh + đoạn text, không có trang chi tiết.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.announcements (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(500) NOT NULL DEFAULT '',
        text TEXT NOT NULL DEFAULT '',
        text_en TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.announcements`);
  }
}
