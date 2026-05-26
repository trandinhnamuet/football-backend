import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideoHighlightsTable1715000000004 implements MigrationInterface {
  name = 'CreateVideoHighlightsTable1715000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.video_highlights (
        id SERIAL PRIMARY KEY,
        youtube_url VARCHAR(500) NOT NULL DEFAULT '',
        title VARCHAR(255) NOT NULL DEFAULT '',
        title_en VARCHAR(255) NOT NULL DEFAULT '',
        is_active BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO football.video_highlights (youtube_url, title, title_en, is_active)
      SELECT '', 'Video Highlight', 'Video Highlight', true
      WHERE NOT EXISTS (SELECT 1 FROM football.video_highlights)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.video_highlights`);
  }
}
