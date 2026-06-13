import { Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AdminGuard } from '../../guards/admin.guard';

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

  // Import players from PLAYER_DATA_URL (adds missing players by full name)
  @Post('import-players')
  @UseGuards(AdminGuard)
  importPlayers() {
    return this.service.importPlayers();
  }
}
