import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminGuard } from './guards/admin.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/admin/verify')
  @UseGuards(AdminGuard)
  verifyAdmin() {
    return { ok: true };
  }
}
