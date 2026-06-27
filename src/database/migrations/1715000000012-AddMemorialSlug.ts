import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemorialSlug1715000000012 implements MigrationInterface {
  name = 'AddMemorialSlug1715000000012';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE football.memorial_posts
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255)
    `);
    // Partial unique index: cho phép nhiều bài chưa có slug (NULL),
    // nhưng slug đã đặt thì phải duy nhất.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_memorial_posts_slug
      ON football.memorial_posts (slug)
      WHERE slug IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS football.idx_memorial_posts_slug`);
    await queryRunner.query(`ALTER TABLE football.memorial_posts DROP COLUMN IF EXISTS slug`);
  }
}
