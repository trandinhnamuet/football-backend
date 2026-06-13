import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSiteSettingsTable1715000000008 implements MigrationInterface {
  name = 'CreateSiteSettingsTable1715000000008';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.site_settings (
        id SERIAL PRIMARY KEY,
        default_theme VARCHAR NOT NULL DEFAULT 'dark',
        theme_version INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO football.site_settings (default_theme, theme_version)
      SELECT 'dark', 1
      WHERE NOT EXISTS (SELECT 1 FROM football.site_settings)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.site_settings`);
  }
}
