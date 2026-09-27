import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { RecruitmentService } from './recruitment.service';
import { AdminGuard } from '../../guards/admin.guard';

// Đảm bảo thư mục upload tồn tại trước lần upload đầu tiên trên máy chủ mới.
mkdirSync(join(process.cwd(), 'uploads', 'recruitment'), { recursive: true });

@Controller('api/recruitment')
export class RecruitmentController {
  constructor(private service: RecruitmentService) {}

  /** Công khai: tất cả tin, tin đang mở xếp trước. */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return /^\d+$/.test(idOrSlug)
      ? this.service.findOne(Number(idOrSlug))
      : this.service.findBySlug(idOrSlug);
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
        destination: './uploads/recruitment',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `recruit-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new Error('Only image files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/recruitment/${file.filename}` };
  }
}
