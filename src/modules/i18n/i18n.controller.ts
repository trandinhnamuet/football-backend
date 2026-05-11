import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/i18n')
export class I18nController {
  constructor(private service: I18nService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Put()
  @UseGuards(AdminGuard)
  update(@Body() body: { vi?: Record<string, any>; en?: Record<string, any> }) {
    return this.service.update(body);
  }
}
