import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPage } from '../../entities/about-page.entity';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AboutPage])],
  providers: [AboutService],
  controllers: [AboutController],
})
export class AboutModule {}
