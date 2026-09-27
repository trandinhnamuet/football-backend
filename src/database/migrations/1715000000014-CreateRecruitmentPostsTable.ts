import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecruitmentPostsTable1715000000014 implements MigrationInterface {
  name = 'CreateRecruitmentPostsTable1715000000014';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS football.recruitment_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255),
        title VARCHAR NOT NULL,
        title_en VARCHAR,
        position VARCHAR(20) NOT NULL DEFAULT 'ANY',
        quantity INTEGER NOT NULL DEFAULT 1,
        content TEXT,
        content_en TEXT,
        excerpt TEXT,
        excerpt_en TEXT,
        image_url VARCHAR(500),
        contact_name VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_link VARCHAR(500),
        is_open BOOLEAN NOT NULL DEFAULT true,
        published_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        expires_at TIMESTAMP WITHOUT TIME ZONE,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    // Partial unique index: slug NULL được phép trùng, slug đã đặt phải duy nhất.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_recruitment_posts_slug
      ON football.recruitment_posts (slug)
      WHERE slug IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS football.idx_recruitment_posts_slug`);
    await queryRunner.query(`DROP TABLE IF EXISTS football.recruitment_posts`);
  }
}
