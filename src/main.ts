import './dns-ipv4-first';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Attach an error handler to the underlying pg pool. When the Supabase pooler
  // drops an idle client, pg emits 'error' on the pool — with no listener that
  // surfaces as an unhandled error event and can crash the process. Handling it
  // lets the pool quietly discard the dead client and create a fresh one.
  const dbLogger = new Logger('Database');
  try {
    const dataSource = app.get(DataSource);
    const pool = (dataSource.driver as { master?: { on?: (event: string, cb: (err: Error) => void) => void } }).master;
    if (pool && typeof pool.on === 'function') {
      pool.on('error', (err: Error) =>
        dbLogger.error(`PG idle client error (handled, pool will recycle): ${err.message}`),
      );
    }
  } catch {
    dbLogger.warn('Could not attach pg pool error handler');
  }

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.0.170:3000',
    'http://192.168.0.170:3001',
    'https://football.trandinhnamz.xyz',
    'https://football.api.trandinhnamz.xyz',
    'https://lonfantafc.com',
    'https://www.lonfantafc.com',
    'https://api.lonfantafc.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now, can be restricted later
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-password'],
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}`);
}
bootstrap();
