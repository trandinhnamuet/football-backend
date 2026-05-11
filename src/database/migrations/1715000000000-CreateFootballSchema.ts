import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFootballSchema1715000000000 implements MigrationInterface {
  name = 'CreateFootballSchema1715000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS football`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS football CASCADE`);
  }
}
