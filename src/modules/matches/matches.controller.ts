import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MatchesService } from './matches.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/matches')
export class MatchesController {
  constructor(private service: MatchesService) {}

  @Post('upload-image')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/matches',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `match-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    return { url: `/uploads/matches/${file.filename}` };
  }

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
