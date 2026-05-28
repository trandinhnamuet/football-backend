import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { AboutPage } from '../../entities/about-page.entity';

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {
    // File already gone or never existed
  }
}

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(AboutPage) private repo: Repository<AboutPage>,
  ) {}

  private async getRow(): Promise<AboutPage> {
    let row = await this.repo.findOneBy({ id: 1 });
    if (!row) {
      row = this.repo.create({ id: 1, banner_image_url: '', content_vi: '', content_en: '' });
      row = await this.repo.save(row);
    }
    return row;
  }

  async get(): Promise<AboutPage> {
    return this.getRow();
  }

  async update(data: Partial<AboutPage>): Promise<AboutPage> {
    const row = await this.getRow();
    if (data.banner_image_url !== undefined) {
      if (row.banner_image_url && row.banner_image_url !== data.banner_image_url) {
        await deleteLocalFile(row.banner_image_url);
      }
      row.banner_image_url = data.banner_image_url;
    }
    if (data.content_vi !== undefined) row.content_vi = data.content_vi;
    if (data.content_en !== undefined) row.content_en = data.content_en;
    return this.repo.save(row);
  }
}
