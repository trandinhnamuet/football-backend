import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoHighlight } from '../../entities/video-highlight.entity';

@Injectable()
export class VideoHighlightService {
  constructor(
    @InjectRepository(VideoHighlight) private repo: Repository<VideoHighlight>,
  ) {}

  private async getRow(): Promise<VideoHighlight> {
    let row = await this.repo.findOneBy({ id: 1 });
    if (!row) {
      row = this.repo.create({ id: 1, youtube_url: '', title: 'Video Highlight', title_en: 'Video Highlight', is_active: true });
      row = await this.repo.save(row);
    }
    return row;
  }

  async get(): Promise<VideoHighlight> {
    return this.getRow();
  }

  async update(data: Partial<VideoHighlight>): Promise<VideoHighlight> {
    const row = await this.getRow();
    if (data.youtube_url !== undefined) row.youtube_url = data.youtube_url;
    if (data.title !== undefined) row.title = data.title;
    if (data.title_en !== undefined) row.title_en = data.title_en;
    if (data.is_active !== undefined) row.is_active = data.is_active;
    return this.repo.save(row);
  }
}
