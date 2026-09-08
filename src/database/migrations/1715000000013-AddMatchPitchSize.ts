import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchPitchSize1715000000013 implements MigrationInterface {
  name = 'AddMatchPitchSize1715000000013';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Loại sân: 5 / 7 / 11 người. Mặc định sân 7 cho các trận đã có.
    await queryRunner.query(`
      ALTER TABLE football.matches
      ADD COLUMN IF NOT EXISTS pitch_size INT NOT NULL DEFAULT 7
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.matches DROP COLUMN IF EXISTS pitch_size`);
  }
}
