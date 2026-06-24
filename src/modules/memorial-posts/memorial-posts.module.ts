import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorialPost } from '../../entities/memorial-post.entity';
import { MemorialPostsController } from './memorial-posts.controller';
import { MemorialPostsService } from './memorial-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemorialPost])],
  controllers: [MemorialPostsController],
  providers: [MemorialPostsService],
})
export class MemorialPostsModule {}
