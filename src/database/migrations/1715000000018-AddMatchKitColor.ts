import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchKitColor1715000000018 implements MigrationInterface {
  name = 'AddMatchKitColor1715000000018';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Màu áo đội mặc trong trận (vd. "Cam", "Đen"), để anh em biết mang áo gì.
    await queryRunner.query(`
      ALTER TABLE football.matches
      ADD COLUMN IF NOT EXISTS kit_color VARCHAR(100)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.matches DROP COLUMN IF EXISTS kit_color`);
  }
}
