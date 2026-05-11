import { Controller, Post, Get, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private service: SyncService) {}

  @Get()
  trigger(@Query('force') force?: string) {
    return this.service.syncFromExcel(force === '1' || force === 'true');
  }

  @Post()
  triggerPost() {
    return this.service.syncFromExcel(true);
  }
}
