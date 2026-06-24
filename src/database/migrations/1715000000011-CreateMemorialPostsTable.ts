import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMemorialPostsTable1715000000011 implements MigrationInterface {
  name = 'CreateMemorialPostsTable1715000000011';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.memorial_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        title_en VARCHAR,
        content TEXT,
        content_en TEXT,
        excerpt TEXT,
        excerpt_en TEXT,
        image_url VARCHAR(500),
        tag VARCHAR(100),
        tag_en VARCHAR(100),
        published_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS football.memorial_posts`);
  }
}
