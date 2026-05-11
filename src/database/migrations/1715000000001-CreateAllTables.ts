import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1715000000001 implements MigrationInterface {
  name = 'CreateAllTables1715000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.players (
        id SERIAL PRIMARY KEY,
        num INTEGER NOT NULL,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        role VARCHAR,
        joined VARCHAR,
        boots VARCHAR,
        nick VARCHAR,
        image_url VARCHAR,
        is_active BOOLEAN NOT NULL DEFAULT true,
        stat_goals INTEGER NOT NULL DEFAULT 0,
        stat_assists INTEGER NOT NULL DEFAULT 0,
        stat_saves INTEGER NOT NULL DEFAULT 0,
        stat_tackles INTEGER NOT NULL DEFAULT 0,
        stat_passes DOUBLE PRECISION NOT NULL DEFAULT 0,
        stat_attendance INTEGER NOT NULL DEFAULT 0,
        stat_minutes INTEGER NOT NULL DEFAULT 0,
        stat_points DOUBLE PRECISION NOT NULL DEFAULT 0,
        stat_matches INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT uq_players_num UNIQUE (num)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        title_en VARCHAR,
        content TEXT NOT NULL,
        content_en TEXT,
        excerpt TEXT,
        excerpt_en TEXT,
        image_url VARCHAR,
        tag VARCHAR,
        tag_en VARCHAR,
        published_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.matches (
        id SERIAL PRIMARY KEY,
        week INTEGER NOT NULL,
        date VARCHAR NOT NULL,
        opponent VARCHAR NOT NULL,
        venue VARCHAR,
        result VARCHAR,
        score VARCHAR,
        goals_for INTEGER NOT NULL DEFAULT 0,
        goals_against INTEGER NOT NULL DEFAULT 0,
        is_upcoming BOOLEAN NOT NULL DEFAULT false,
        time VARCHAR,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.sync_cache (
        id SERIAL PRIMARY KEY,
        key VARCHAR NOT NULL,
        value TEXT,
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT uq_sync_cache_key UNIQUE (key)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.sync_cache`);
    await queryRunner.query(`DROP TABLE IF EXISTS football.matches`);
    await queryRunner.query(`DROP TABLE IF EXISTS football.articles`);
    await queryRunner.query(`DROP TABLE IF EXISTS football.players`);
  }
}
