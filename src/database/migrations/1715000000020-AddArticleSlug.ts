import { MigrationInterface, QueryRunner } from 'typeorm';
import { slugify, uniqueSlug } from '../../modules/articles/slug.util';

export class AddArticleSlug1715000000020 implements MigrationInterface {
  name = 'AddArticleSlug1715000000020';

  async up(queryRunner: QueryRunner): Promise<void> {
    // URL bài viết dạng /news/<slug-tieu-de> thay cho /news/<id> để tốt cho SEO.
    await queryRunner.query(`
      ALTER TABLE football.articles
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug
      ON football.articles (slug)
      WHERE slug IS NOT NULL
    `);

    // Sinh slug cho các bài đã có, bài cũ hơn giữ slug gọn (không hậu tố).
    const rows: { id: number; title: string; slug: string | null }[] = await queryRunner.query(
      `SELECT id, title, slug FROM football.articles ORDER BY published_at ASC, id ASC`,
    );
    const taken = new Set(rows.map((r) => r.slug).filter((s): s is string => !!s));
    for (const row of rows) {
      if (row.slug) continue;
      const slug = uniqueSlug(slugify(row.title), (s) => taken.has(s));
      taken.add(slug);
      await queryRunner.query(`UPDATE football.articles SET slug = $1 WHERE id = $2`, [slug, row.id]);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS football.idx_articles_slug`);
    await queryRunner.query(`ALTER TABLE football.articles DROP COLUMN IF EXISTS slug`);
  }
}
