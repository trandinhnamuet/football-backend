import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixYoutubeChannelUrl1715000000022 implements MigrationInterface {
  name = 'FixYoutubeChannelUrl1715000000022';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Handle @fclonfanta không tồn tại (404); kênh thật là @lonfantafc.
    await queryRunner.query(`
      ALTER TABLE football.video_highlights
      ALTER COLUMN channel_url SET DEFAULT 'https://www.youtube.com/@lonfantafc'
    `);
    await queryRunner.query(`
      UPDATE football.video_highlights
      SET channel_url = 'https://www.youtube.com/@lonfantafc'
      WHERE channel_url ILIKE '%youtube.com/@fclonfanta%'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE football.video_highlights
      ALTER COLUMN channel_url SET DEFAULT 'https://www.youtube.com/@fclonfanta'
    `);
  }
}
