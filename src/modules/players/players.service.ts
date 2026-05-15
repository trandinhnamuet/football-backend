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

  async update(id: number, data: Partial<Player>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async updateImage(id: number, imageUrl: string) {
    const player = await this.findOne(id);
    await deleteLocalFile(player.image_url);
    await this.repo.update(id, { image_url: imageUrl });
    return this.findOne(id);
  }

  leaderboard() {
    return this.repo.find({
      where: { is_active: true },
      order: { stat_points: 'DESC' },
    });
  }
}
