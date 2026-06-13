import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayerZoomImage1715000000009 implements MigrationInterface {
  name = 'AddPlayerZoomImage1715000000009';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE football.players
      ADD COLUMN IF NOT EXISTS zoom_image_url VARCHAR(500)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.players DROP COLUMN IF EXISTS zoom_image_url`);
  }
}
