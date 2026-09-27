import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tách "thông báo" khỏi "tin tức" bằng một trường loại bài trên cùng bảng
 * articles, thay vì tạo module riêng. Thông báo có thể ghim và có hạn hiển thị.
 * Bài cũ mặc định là tin tức; admin gán lại loại nếu cần.
 */
export class AddArticleKind1715000000015 implements MigrationInterface {
  name = 'AddArticleKind1715000000015';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE football.articles
      ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'news'
    `);
    await queryRunner.query(`
      ALTER TABLE football.articles
      ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE football.articles
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITHOUT TIME ZONE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.articles DROP COLUMN IF EXISTS expires_at`);
    await queryRunner.query(`ALTER TABLE football.articles DROP COLUMN IF EXISTS is_pinned`);
    await queryRunner.query(`ALTER TABLE football.articles DROP COLUMN IF EXISTS kind`);
  }
}
