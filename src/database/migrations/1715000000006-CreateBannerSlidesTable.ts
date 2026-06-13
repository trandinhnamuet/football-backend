import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBannerSlidesTable1715000000006 implements MigrationInterface {
  name = 'CreateBannerSlidesTable1715000000006';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.banner_slides (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(500) NOT NULL DEFAULT '',
        caption VARCHAR(255) NOT NULL DEFAULT '',
        caption_en VARCHAR(255) NOT NULL DEFAULT '',
        link_url VARCHAR(500) NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.banner_slides`);
  }
}
