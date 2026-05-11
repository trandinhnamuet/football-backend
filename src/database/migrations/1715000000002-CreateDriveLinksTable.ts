import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDriveLinksTable1715000000002 implements MigrationInterface {
  name = 'CreateDriveLinksTable1715000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.drive_links (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        is_public BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.drive_links`);
  }
}
