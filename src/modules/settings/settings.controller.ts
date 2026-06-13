import { Controller, Get, Put, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get('theme')
  getTheme() {
    return this.service.getTheme();
  }

  @Put('theme')
  @UseGuards(AdminGuard)
  setTheme(@Body() body: { theme?: string }) {
    if (body.theme !== 'dark' && body.theme !== 'light') {
      throw new BadRequestException("theme must be 'dark' or 'light'");
    }
    return this.service.setTheme(body.theme);
  }
}
