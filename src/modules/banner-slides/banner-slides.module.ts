import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerSlide } from '../../entities/banner-slide.entity';
import { BannerSlidesService } from './banner-slides.service';
import { BannerSlidesController } from './banner-slides.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BannerSlide])],
  providers: [BannerSlidesService],
  controllers: [BannerSlidesController],
})
export class BannerSlidesModule {}
