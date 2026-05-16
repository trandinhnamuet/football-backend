import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from './guards/admin.guard';

@Controller()
export class AppController {
  @Get('api/admin/verify')
  @UseGuards(AdminGuard)
  verifyAdmin() {
    return { ok: true };
  }
}
