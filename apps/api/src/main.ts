import 'reflect-metadata';
import { config } from 'dotenv';

config({ path: '../../.env' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
