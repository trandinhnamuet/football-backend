import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateI18nSettingsTable1715000000003 implements MigrationInterface {
  name = 'CreateI18nSettingsTable1715000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.i18n_settings (
        id SERIAL PRIMARY KEY,
        data_vi TEXT NOT NULL DEFAULT '{}',
        data_en TEXT NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO football.i18n_settings (data_vi, data_en)
      SELECT '{}', '{}'
      WHERE NOT EXISTS (SELECT 1 FROM football.i18n_settings)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.i18n_settings`);
  }
}
