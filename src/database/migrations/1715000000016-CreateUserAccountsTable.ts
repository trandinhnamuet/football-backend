import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAccountsTable1715000000016 implements MigrationInterface {
  name = 'CreateUserAccountsTable1715000000016';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.user_accounts (
        id SERIAL PRIMARY KEY,
        player_id INTEGER UNIQUE REFERENCES football.players(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        is_default_password BOOLEAN NOT NULL DEFAULT true,
        password_version INTEGER NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMP WITHOUT TIME ZONE,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.user_accounts`);
  }
}
