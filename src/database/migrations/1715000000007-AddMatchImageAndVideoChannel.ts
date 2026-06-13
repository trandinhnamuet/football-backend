import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchImageAndVideoChannel1715000000007 implements MigrationInterface {
  name = 'AddMatchImageAndVideoChannel1715000000007';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE football.matches
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)
    `);
    await queryRunner.query(`
      ALTER TABLE football.video_highlights
      ADD COLUMN IF NOT EXISTS channel_url VARCHAR(500) NOT NULL DEFAULT 'https://www.youtube.com/@fclonfanta'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.matches DROP COLUMN IF EXISTS image_url`);
    await queryRunner.query(`ALTER TABLE football.video_highlights DROP COLUMN IF EXISTS channel_url`);
  }
}
