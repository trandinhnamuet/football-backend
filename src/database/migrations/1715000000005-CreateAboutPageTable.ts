import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAboutPageTable1715000000005 implements MigrationInterface {
  name = 'CreateAboutPageTable1715000000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.about_page (
        id SERIAL PRIMARY KEY,
        banner_image_url VARCHAR(500) NOT NULL DEFAULT '',
        content_vi TEXT NOT NULL DEFAULT '',
        content_en TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO football.about_page (banner_image_url, content_vi, content_en)
      SELECT '', '', ''
      WHERE NOT EXISTS (SELECT 1 FROM football.about_page)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.about_page`);
  }
}
