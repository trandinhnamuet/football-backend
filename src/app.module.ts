import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Player } from './entities/player.entity';
import { Article } from './entities/article.entity';
import { Match } from './entities/match.entity';
import { SyncCache } from './entities/sync-cache.entity';
import { DriveLink } from './entities/drive-link.entity';
import { I18nSetting } from './entities/i18n-setting.entity';
import { VideoHighlight } from './entities/video-highlight.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './modules/players/players.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { MatchesModule } from './modules/matches/matches.module';
import { SyncModule } from './modules/sync/sync.module';
import { DriveLinksModule } from './modules/drive-links/drive-links.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { VideoHighlightModule } from './modules/video-highlight/video-highlight.module';
import { AboutModule } from './modules/about/about.module';
import { AboutPage } from './entities/about-page.entity';
import { BannerSlide } from './entities/banner-slide.entity';
import { BannerSlidesModule } from './modules/banner-slides/banner-slides.module';
import { SiteSetting } from './entities/site-setting.entity';
import { SettingsModule } from './modules/settings/settings.module';
import { CreateFootballSchema1715000000000 } from './database/migrations/1715000000000-CreateFootballSchema';
import { CreateAllTables1715000000001 } from './database/migrations/1715000000001-CreateAllTables';
import { CreateDriveLinksTable1715000000002 } from './database/migrations/1715000000002-CreateDriveLinksTable';
import { CreateI18nSettingsTable1715000000003 } from './database/migrations/1715000000003-CreateI18nSettingsTable';
import { CreateVideoHighlightsTable1715000000004 } from './database/migrations/1715000000004-CreateVideoHighlightsTable';
import { CreateAboutPageTable1715000000005 } from './database/migrations/1715000000005-CreateAboutPageTable';
import { CreateBannerSlidesTable1715000000006 } from './database/migrations/1715000000006-CreateBannerSlidesTable';
import { AddMatchImageAndVideoChannel1715000000007 } from './database/migrations/1715000000007-AddMatchImageAndVideoChannel';
import { CreateSiteSettingsTable1715000000008 } from './database/migrations/1715000000008-CreateSiteSettingsTable';
import { AddPlayerZoomImage1715000000009 } from './database/migrations/1715000000009-AddPlayerZoomImage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '.env.local'), join(process.cwd(), '.env')],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +(config.get<string>('DB_PORT') || '5432'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Player, Article, Match, SyncCache, DriveLink, I18nSetting, VideoHighlight, AboutPage, BannerSlide, SiteSetting],
        synchronize: false,
        migrationsRun: true,
        migrationsTableName: 'migrations',
        migrations: [CreateFootballSchema1715000000000, CreateAllTables1715000000001, CreateDriveLinksTable1715000000002, CreateI18nSettingsTable1715000000003, CreateVideoHighlightsTable1715000000004, CreateAboutPageTable1715000000005, CreateBannerSlidesTable1715000000006, AddMatchImageAndVideoChannel1715000000007, CreateSiteSettingsTable1715000000008, AddPlayerZoomImage1715000000009],
        ssl: { rejectUnauthorized: false },
        extra: { connectionTimeoutMillis: 10000 },
      }),
      inject: [ConfigService],
    }),
    PlayersModule,
    ArticlesModule,
    MatchesModule,
    SyncModule,
    DriveLinksModule,
    I18nModule,
    VideoHighlightModule,
    AboutModule,
    BannerSlidesModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
