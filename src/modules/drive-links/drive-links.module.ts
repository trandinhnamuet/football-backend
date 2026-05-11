import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveLink } from '../../entities/drive-link.entity';
import { DriveLinksService } from './drive-links.service';
import { DriveLinksController } from './drive-links.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DriveLink])],
  providers: [DriveLinksService],
  controllers: [DriveLinksController],
})
export class DriveLinksModule {}
