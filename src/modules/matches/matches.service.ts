import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, SPLIT_RESULT } from '../../entities/match.entity';

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
    // Trận chia đôi là mình đá với mình: không có thắng/hòa/thua, và bàn thắng
    // của cả hai bên đều là của đội nên không được cộng vào hiệu số.
    const competitive = matches.filter(m => m.result !== SPLIT_RESULT);
    return {
      played: matches.length,
      wins: matches.filter(m => m.result === 'W').length,
      draws: matches.filter(m => m.result === 'D').length,
      losses: matches.filter(m => m.result === 'L').length,
      splits: matches.filter(m => m.result === SPLIT_RESULT).length,
      gf: competitive.reduce((s, m) => s + (m.goals_for || 0), 0),
      ga: competitive.reduce((s, m) => s + (m.goals_against || 0), 0),
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
