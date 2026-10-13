import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/configure-app';

export async function createTestApp() {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}
