import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { RecruitmentPost } from '../../entities/recruitment-post.entity';

export const RECRUIT_POSITIONS = ['GK', 'DEF', 'MID', 'FWD', 'ANY'] as const;

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {}
}

// Bỏ dấu tiếng Việt, hạ chữ thường, thay ký tự lạ bằng "-".
// "Tuyển thủ môn" -> "tuyen-thu-mon".
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
export class RecruitmentService {
  constructor(
    @InjectRepository(RecruitmentPost)
    private repo: Repository<RecruitmentPost>,
  ) {}

  findAll() {
    return this.repo.find({ order: { is_open: 'DESC', published_at: 'DESC' } });
  }

  async findOne(id: number) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Recruitment post not found');
    return p;
  }

  async findBySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug } });
    if (!p) throw new NotFoundException('Recruitment post not found');
    return p;
  }

  // Slug duy nhất; tự thêm -2, -3... nếu trùng. Trả về null nếu chuỗi rỗng.
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

  private normalize(data: Partial<RecruitmentPost>) {
    if (data.position !== undefined) {
      const pos = String(data.position || 'ANY').toUpperCase();
      if (!(RECRUIT_POSITIONS as readonly string[]).includes(pos)) {
        throw new BadRequestException(`Invalid position: ${data.position}`);
      }
      data.position = pos;
    }
    if (data.quantity !== undefined) {
      const q = Number(data.quantity);
      data.quantity = Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
    }
    if (data.expires_at !== undefined && !data.expires_at) {
      data.expires_at = null;
    }
    return data;
  }

  async create(data: Partial<RecruitmentPost>) {
    this.normalize(data);
    // Không nhập slug thì lấy từ tiêu đề để URL đẹp: /recruitment/tuyen-thu-mon
    data.slug = (await this.resolveSlug(data.slug || data.title)) as string;
    const post = this.repo.create(data);
    return this.repo.save(post);
  }

  async update(id: number, data: Partial<RecruitmentPost>) {
    this.normalize(data);
    if (data.image_url !== undefined) {
      const existing = await this.findOne(id);
      if (existing.image_url && existing.image_url !== data.image_url) {
        await deleteLocalFile(existing.image_url);
      }
    }
    if (data.slug !== undefined) {
      data.slug = (await this.resolveSlug(data.slug || data.title, id)) as string;
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
