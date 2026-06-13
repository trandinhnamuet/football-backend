import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Player } from '../../entities/player.entity';

async function deleteLocalFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch {
    // File already gone or never existed
  }
}

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private repo: Repository<Player>,
  ) {}

  findAll(includeInactive = false) {
    if (includeInactive) return this.repo.find({ order: { stat_points: 'DESC' } });
    return this.repo.find({ where: { is_active: true }, order: { stat_points: 'DESC' } });
  }

  async findOne(id: number) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Player not found');
    return p;
  }

  async create(data: Partial<Player>) {
    // Auto-assign a free jersey number if missing or already taken
    let num = Number(data.num);
    if (!num || isNaN(num) || (await this.repo.findOne({ where: { num } }))) {
      const all = await this.repo.find();
      const used = new Set(all.map(p => p.num));
      num = (used.size ? Math.max(...used) : 0) + 1;
      while (used.has(num)) num++;
    }
    const player = this.repo.create({
      num,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      role: data.role || 'Tự do',
      joined: data.joined || new Date().getFullYear().toString(),
      boots: data.boots || 'Phải',
      nick: data.nick || data.last_name || data.first_name || '',
      is_active: data.is_active ?? true,
    });
    return this.repo.save(player);
  }

  async update(id: number, data: Partial<Player>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const player = await this.findOne(id);
    await deleteLocalFile(player.image_url);
    await deleteLocalFile(player.zoom_image_url);
    await this.repo.delete(id);
    return { deleted: true, id };
  }

  async updateImage(id: number, imageUrl: string) {
    const player = await this.findOne(id);
    await deleteLocalFile(player.image_url);
    await this.repo.update(id, { image_url: imageUrl });
    return this.findOne(id);
  }

  async updateZoomImage(id: number, imageUrl: string) {
    const player = await this.findOne(id);
    await deleteLocalFile(player.zoom_image_url);
    await this.repo.update(id, { zoom_image_url: imageUrl });
    return this.findOne(id);
  }

  leaderboard() {
    return this.repo.find({
      where: { is_active: true },
      order: { stat_points: 'DESC' },
    });
  }
}
