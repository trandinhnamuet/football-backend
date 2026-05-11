import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../entities/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private repo: Repository<Match>,
  ) {}

  findAll() {
    return this.repo.find({ order: { week: 'ASC' } });
  }

  findPlayed() {
    return this.repo.find({ where: { is_upcoming: false }, order: { week: 'DESC' } });
  }

  findUpcoming() {
    return this.repo.find({ where: { is_upcoming: true }, order: { week: 'ASC' } });
  }

  async teamStats() {
    const matches = await this.repo.find({ where: { is_upcoming: false } });
    return {
      played: matches.length,
      wins: matches.filter(m => m.result === 'W').length,
      draws: matches.filter(m => m.result === 'D').length,
      losses: matches.filter(m => m.result === 'L').length,
      gf: matches.reduce((s, m) => s + (m.goals_for || 0), 0),
      ga: matches.reduce((s, m) => s + (m.goals_against || 0), 0),
    };
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Match>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Match>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
