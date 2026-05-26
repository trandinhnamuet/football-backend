import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoHighlight } from '../../entities/video-highlight.entity';
import { VideoHighlightService } from './video-highlight.service';
import { VideoHighlightController } from './video-highlight.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoHighlight])],
  providers: [VideoHighlightService],
  controllers: [VideoHighlightController],
})
export class VideoHighlightModule {}
