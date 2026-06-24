import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { MemorialPost } from '../../entities/memorial-post.entity';

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {}
}

@Injectable()
export class MemorialPostsService {
  constructor(
    @InjectRepository(MemorialPost)
    private repo: Repository<MemorialPost>,
  ) {}

  findAll() {
    return this.repo.find({ order: { published_at: 'DESC' } });
  }

  async findOne(id: number) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Memorial post not found');
    return p;
  }

  create(data: Partial<MemorialPost>) {
    const post = this.repo.create(data);
    return this.repo.save(post);
  }

  async update(id: number, data: Partial<MemorialPost>) {
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
    const post = await this.findOne(id);
    await deleteLocalFile(post.image_url);
    await this.repo.delete(id);
    return { success: true };
  }
}
