import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/matches')
export class MatchesController {
  constructor(private service: MatchesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('played')
  findPlayed() {
    return this.service.findPlayed();
  }

  @Get('upcoming')
  findUpcoming() {
    return this.service.findUpcoming();
  }

  @Get('stats')
  teamStats() {
    return this.service.teamStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
