import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { VideoHighlightService } from './video-highlight.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/video-highlight')
export class VideoHighlightController {
  constructor(private service: VideoHighlightService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Get('recommendations')
  recommendations() {
    return this.service.getRecommendations();
  }

  @Put()
  @UseGuards(AdminGuard)
  update(@Body() body: { youtube_url?: string; title?: string; title_en?: string; is_active?: boolean; channel_url?: string }) {
    return this.service.update(body);
  }
}
