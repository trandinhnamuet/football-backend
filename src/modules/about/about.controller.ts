import {
  Controller, Get, Put, Post, Body,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AboutService } from './about.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/about')
export class AboutController {
  constructor(private service: AboutService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Put()
  @UseGuards(AdminGuard)
  update(@Body() body: { banner_image_url?: string; content_vi?: string; content_en?: string }) {
    return this.service.update(body);
  }

  @Post('upload-banner')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/about',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `about-banner-${unique}${extname(file.originalname)}`);
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
  uploadBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    return { url: `/uploads/about/${file.filename}` };
  }
}
