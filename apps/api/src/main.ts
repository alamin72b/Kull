import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { isProductionEnvironment } from './auth/auth.constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const cookieSecret = process.env.COOKIE_SECRET?.trim();
  if (isProductionEnvironment() && !cookieSecret) {
    throw new Error('COOKIE_SECRET must be set in production.');
  }

  app.setGlobalPrefix('api');

  app.use(
    cookieParser(
      cookieSecret ?? 'temporary-kull-development-secret',
    ),
  );

  app.enableCors({
    origin: isProductionEnvironment()
      ? process.env.WEB_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:3000'
      : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port);

  console.log(`Kull API running at http://localhost:${port}`);
}

void bootstrap();
