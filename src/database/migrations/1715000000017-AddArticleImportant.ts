import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticleImportant1715000000017 implements MigrationInterface {
  name = 'AddArticleImportant1715000000017';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Thông báo quan trọng: chỉ một bài được đánh dấu tại một thời điểm, và có
    // thể hẹn ngày hết quan trọng (NULL = không hẹn).
    await queryRunner.query(`
      ALTER TABLE football.articles
      ADD COLUMN IF NOT EXISTS is_important BOOLEAN NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE football.articles
      ADD COLUMN IF NOT EXISTS important_until DATE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.articles DROP COLUMN IF EXISTS important_until`);
    await queryRunner.query(`ALTER TABLE football.articles DROP COLUMN IF EXISTS is_important`);
  }
}
