import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchKitColor21715000000019 implements MigrationInterface {
  name = 'AddMatchKitColor21715000000019';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Một trận có thể cần 2 màu áo (vd. mang cả Cam và Đen để đổi nếu trùng).
    await queryRunner.query(`
      ALTER TABLE football.matches
      ADD COLUMN IF NOT EXISTS kit_color_2 VARCHAR(100)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE football.matches DROP COLUMN IF EXISTS kit_color_2`);
  }
}
