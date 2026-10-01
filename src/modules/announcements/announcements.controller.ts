import {
  Controller, Get, Post, Patch, Delete, Param, Body, BadRequestException,
  UseGuards, UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import { AnnouncementsService, ANNOUNCEMENT_MEDIA_DIR } from './announcements.service';
import { AdminGuard } from '../../guards/admin.guard';

// multer's diskStorage does not create its destination, so make sure it exists
// before the first upload on a fresh deploy.
mkdirSync(ANNOUNCEMENT_MEDIA_DIR, { recursive: true });

@Controller('api/announcements')
export class AnnouncementsController {
  constructor(private service: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('public')
  findPublic() {
    return this.service.findPublic();
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

  @Post('upload-image')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: ANNOUNCEMENT_MEDIA_DIR,
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `announcement-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|avif)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image uploaded');
    return { url: `/uploads/announcements/${file.filename}` };
  }
}
