import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriveLink } from '../../entities/drive-link.entity';

@Injectable()
export class DriveLinksService {
  constructor(
    @InjectRepository(DriveLink) private repo: Repository<DriveLink>,
  ) {}

  findAll(): Promise<DriveLink[]> {
    return this.repo.find({ order: { sort_order: 'ASC', created_at: 'DESC' } });
  }

  findPublic(): Promise<DriveLink[]> {
    return this.repo.find({
      where: { is_public: true },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DriveLink> {
    const link = await this.repo.findOneBy({ id });
    if (!link) throw new NotFoundException(`DriveLink #${id} not found`);
    return link;
  }

  create(data: Partial<DriveLink>): Promise<DriveLink> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<DriveLink>): Promise<DriveLink> {
    const link = await this.findOne(id);
    Object.assign(link, data);
    return this.repo.save(link);
  }

  async remove(id: number): Promise<void> {
    const link = await this.findOne(id);
    await this.repo.remove(link);
  }
}
