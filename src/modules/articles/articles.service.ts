import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { Article } from '../../entities/article.entity';

export const ARTICLE_MEDIA_DIR = join(process.cwd(), 'uploads', 'articles');

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
// No path separators, so a filename can never escape ARTICLE_MEDIA_DIR.
const SAFE_FILENAME = /^[A-Za-z0-9._-]+$/;

export interface ArticleImage {
  filename: string;
  url: string;
  size: number;
  uploaded_at: string;
}

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {
    // File already gone or never existed
  }
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private repo: Repository<Article>,
  ) {}

  findAll() {
    return this.repo.find({ order: { published_at: 'DESC' } });
  }

  /**
   * Thông báo quan trọng đang còn hiệu lực (chưa qua ngày hẹn), hoặc null.
   * Chỉ một bài được đánh dấu tại một thời điểm — xem normalizeImportant.
   */
  async findImportant(): Promise<Article | null> {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await this.repo.find({
      where: [
        { is_important: true, important_until: IsNull() },
        { is_important: true, important_until: MoreThanOrEqual(today) },
      ],
      order: { published_at: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  /**
   * Ngày hẹn rỗng → NULL. Khi bật quan trọng cho một bài thì tắt ở mọi bài
   * khác để luôn chỉ có một thông báo quan trọng.
   */
  private async normalizeImportant(data: Partial<Article>, exceptId?: number): Promise<void> {
    if ('important_until' in data && !data.important_until) data.important_until = null;
    if (data.is_important) {
      await this.repo.update(
        exceptId === undefined ? { is_important: true } : { is_important: true, id: Not(exceptId) },
        { is_important: false },
      );
    }
  }

  async findOne(id: number) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Article not found');
    return a;
  }

  async create(data: Partial<Article>) {
    await this.normalizeImportant(data);
    const article = this.repo.create(data);
    return this.repo.save(article);
  }

  async update(id: number, data: Partial<Article>) {
    await this.normalizeImportant(data, id);
    if (data.image_url !== undefined) {
      const existing = await this.findOne(id);
      if (existing.image_url && existing.image_url !== data.image_url) {
        await deleteLocalFile(existing.image_url);
      }
    }
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const article = await this.findOne(id);
    await deleteLocalFile(article.image_url);
    await this.repo.delete(id);
    return { success: true };
  }

  /** Every image ever uploaded for articles, newest first. */
  async listImages(): Promise<ArticleImage[]> {
    await mkdir(ARTICLE_MEDIA_DIR, { recursive: true });
    const names = (await readdir(ARTICLE_MEDIA_DIR)).filter((n) => IMAGE_EXT.test(n));
    const images = await Promise.all(
      names.map(async (filename) => {
        const info = await stat(join(ARTICLE_MEDIA_DIR, filename));
        return {
          filename,
          url: `/uploads/articles/${filename}`,
          size: info.size,
          uploaded_at: info.mtime.toISOString(),
        };
      }),
    );
    return images.sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  }

  async removeImage(filename: string) {
    if (!SAFE_FILENAME.test(filename) || filename.includes('..')) {
      throw new BadRequestException('Invalid filename');
    }
    try {
      await unlink(join(ARTICLE_MEDIA_DIR, filename));
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') {
        throw new NotFoundException('Image not found');
      }
      throw e;
    }
    return { deleted: true, filename };
  }
}
