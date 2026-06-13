import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { BannerSlide } from '../../entities/banner-slide.entity';

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {
    // File already gone or never existed
  }
}

@Injectable()
export class BannerSlidesService {
  constructor(
    @InjectRepository(BannerSlide) private repo: Repository<BannerSlide>,
  ) {}

  findAll(): Promise<BannerSlide[]> {
    return this.repo.find({ order: { sort_order: 'ASC', id: 'ASC' } });
  }

  findPublic(): Promise<BannerSlide[]> {
    return this.repo.find({ where: { is_active: true }, order: { sort_order: 'ASC', id: 'ASC' } });
  }

  async create(data: Partial<BannerSlide>): Promise<BannerSlide> {
    if (data.sort_order === undefined) {
      const count = await this.repo.count();
      data.sort_order = count;
    }
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<BannerSlide>): Promise<BannerSlide | null> {
    const row = await this.repo.findOneBy({ id });
    if (!row) return null;
    if (data.image_url !== undefined && row.image_url && row.image_url !== data.image_url) {
      await deleteLocalFile(row.image_url);
    }
    await this.repo.update(id, data);
    return this.repo.findOneBy({ id });
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const row = await this.repo.findOneBy({ id });
    if (row) await deleteLocalFile(row.image_url);
    await this.repo.delete(id);
    return { deleted: true };
  }
}
