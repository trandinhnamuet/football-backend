import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nSetting } from '../../entities/i18n-setting.entity';

@Injectable()
export class I18nService {
  constructor(
    @InjectRepository(I18nSetting) private repo: Repository<I18nSetting>,
  ) {}

  private async getRow(): Promise<I18nSetting> {
    let row = await this.repo.findOneBy({ id: 1 });
    if (!row) {
      row = this.repo.create({ id: 1, data_vi: '{}', data_en: '{}' });
      row = await this.repo.save(row);
    }
    return row;
  }

  async getAll(): Promise<{ vi: Record<string, any>; en: Record<string, any> }> {
    const row = await this.getRow();
    return {
      vi: this.safeParse(row.data_vi),
      en: this.safeParse(row.data_en),
    };
  }

  async update(data: { vi?: Record<string, any>; en?: Record<string, any> }): Promise<void> {
    const row = await this.getRow();
    if (data.vi !== undefined) row.data_vi = JSON.stringify(data.vi);
    if (data.en !== undefined) row.data_en = JSON.stringify(data.en);
    await this.repo.save(row);
  }

  private safeParse(str: string): Record<string, any> {
    try { return JSON.parse(str) || {}; }
    catch { return {}; }
  }
}
