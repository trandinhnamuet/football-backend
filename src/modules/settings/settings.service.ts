import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../../entities/site-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting) private repo: Repository<SiteSetting>,
  ) {}

  private async getRow(): Promise<SiteSetting> {
    let row = await this.repo.findOneBy({ id: 1 });
    if (!row) {
      row = this.repo.create({ id: 1, default_theme: 'dark', theme_version: 1 });
      row = await this.repo.save(row);
    }
    return row;
  }

  async getTheme(): Promise<{ theme: 'dark' | 'light'; version: number }> {
    const row = await this.getRow();
    const theme = row.default_theme === 'light' ? 'light' : 'dark';
    return { theme, version: row.theme_version };
  }

  // Set the default theme for all users. Bumps the version so every client
  // applies it once on their next visit.
  async setTheme(theme: 'dark' | 'light'): Promise<{ theme: 'dark' | 'light'; version: number }> {
    const row = await this.getRow();
    row.default_theme = theme === 'light' ? 'light' : 'dark';
    row.theme_version = (row.theme_version || 0) + 1;
    await this.repo.save(row);
    return { theme: row.default_theme as 'dark' | 'light', version: row.theme_version };
  }
}
