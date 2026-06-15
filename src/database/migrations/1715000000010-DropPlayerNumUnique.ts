import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPlayerNumUnique1715000000010 implements MigrationInterface {
  name = 'DropPlayerNumUnique1715000000010';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Cho phép nhiều cầu thủ trùng số áo: bỏ ràng buộc duy nhất trên cột num.
    await queryRunner.query(
      `ALTER TABLE football.players DROP CONSTRAINT IF EXISTS uq_players_num`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE football.players ADD CONSTRAINT uq_players_num UNIQUE (num)`,
    );
  }
}
