import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { MemorialPost } from '../../entities/memorial-post.entity';

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {}
}

// Chuẩn hoá slug: bỏ dấu tiếng Việt, hạ chữ thường, thay ký tự lạ bằng "-".
// Ví dụ: "Ngô Thanh Tuấn" -> "ngo-thanh-tuan".
function slugify(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

  async findBySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug } });
    if (!p) throw new NotFoundException('Memorial post not found');
    return p;
  }

  // Sinh slug duy nhất từ chuỗi admin nhập. Trả về null nếu để trống
  // (khi đó URL dùng id). Tự thêm hậu tố -2, -3... nếu bị trùng.
  private async resolveSlug(raw: string | null | undefined, excludeId?: number): Promise<string | null> {
    const base = slugify(raw || '');
    if (!base) return null;
    let candidate = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const clash = await this.repo.findOne({
        where: excludeId ? { slug: candidate, id: Not(excludeId) } : { slug: candidate },
      });
      if (!clash) return candidate;
      candidate = `${base}-${n++}`;
    }
  }

  async create(data: Partial<MemorialPost>) {
    if (data.slug !== undefined) {
      data.slug = (await this.resolveSlug(data.slug)) as string;
    }
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
    if (data.slug !== undefined) {
      data.slug = (await this.resolveSlug(data.slug, id)) as string;
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
