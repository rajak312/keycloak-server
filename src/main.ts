import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
