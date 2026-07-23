import {
  Controller, Get, Post, Patch, Delete, Param, Body, BadRequestException,
  UseGuards, UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import { ArticlesService, ARTICLE_MEDIA_DIR } from './articles.service';
import { AdminGuard } from '../../guards/admin.guard';

// multer's diskStorage does not create its destination, so make sure it exists
// before the first upload on a fresh deploy.
mkdirSync(ARTICLE_MEDIA_DIR, { recursive: true });

@Controller('api/articles')
export class ArticlesController {
  constructor(private service: ArticlesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Must be declared before `:id`, otherwise ParseIntPipe rejects "images".
  @Get('images')
  @UseGuards(AdminGuard)
  listImages() {
    return this.service.listImages();
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

  @Delete('images/:filename')
  @UseGuards(AdminGuard)
  removeImage(@Param('filename') filename: string) {
    return this.service.removeImage(filename);
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
        destination: ARTICLE_MEDIA_DIR,
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `article-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|avif)$/)) {
          return cb(new Error('Only image files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image uploaded');
    return {
      url: `/uploads/articles/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }
}
