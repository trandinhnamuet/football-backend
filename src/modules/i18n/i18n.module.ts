import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nSetting } from '../../entities/i18n-setting.entity';
import { I18nService } from './i18n.service';
import { I18nController } from './i18n.controller';

@Module({
  imports: [TypeOrmModule.forFeature([I18nSetting])],
  providers: [I18nService],
  controllers: [I18nController],
})
export class I18nModule {}
