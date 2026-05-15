import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Article } from '../../entities/article.entity';

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

  async findOne(id: number) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Article not found');
    return a;
  }

  create(data: Partial<Article>) {
    const article = this.repo.create(data);
    return this.repo.save(article);
  }

  async update(id: number, data: Partial<Article>) {
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
}
