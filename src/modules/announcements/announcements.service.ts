import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Announcement } from '../../entities/announcement.entity';

export const ANNOUNCEMENT_MEDIA_DIR = join(process.cwd(), 'uploads', 'announcements');

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {
    // File already gone or never existed
  }
}

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private repo: Repository<Announcement>,
  ) {}

  findAll(): Promise<Announcement[]> {
    return this.repo.find({ order: { sort_order: 'ASC', id: 'DESC' } });
  }

  findPublic(): Promise<Announcement[]> {
    return this.repo.find({ where: { is_active: true }, order: { sort_order: 'ASC', id: 'DESC' } });
  }

  async create(data: Partial<Announcement>): Promise<Announcement> {
    // Thông báo mới lên đầu: lấy thứ tự nhỏ hơn mọi bài đang có.
    if (data.sort_order === undefined) {
      const first = await this.repo.find({ order: { sort_order: 'ASC' }, take: 1 });
      data.sort_order = first.length ? first[0].sort_order - 1 : 0;
    }
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Announcement>): Promise<Announcement | null> {
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
