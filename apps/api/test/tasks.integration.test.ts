import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

// Opt-in: point DATABASE_URL_TEST at a migrated, disposable PostgreSQL database.
test(
  'HTTP CRUD persists across app restart and enforces the API contract',
  {
    skip: !process.env.DATABASE_URL_TEST,
  },
  async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
    const makeApp = async () => {
      const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
      const app = module.createNestApplication();
      configureApp(app);
      await app.init();
      return app;
    };
    let app = await makeApp();
    let id: string | undefined;
    try {
      await request(app.getHttpServer()).get('/api/health').expect(200);
      await request(app.getHttpServer()).post('/api/tasks').send({ title: ' ' }).expect(400);
      await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'Task', priority: 'urgent' })
        .expect(400);
      const created = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: '  Integration task  ', description: 'Persistent notes', priority: 'high' })
        .expect(201);
      id = created.body.id as string;
      assert.equal(created.body.title, 'Integration task');
      assert.equal(created.body.status, 'new');
      await request(app.getHttpServer())
        .patch(`/api/tasks/${id}`)
        .send({ status: 'done', title: 'Edited task' })
        .expect(200);
      await app.close();
      app = await makeApp();
      const persisted = await request(app.getHttpServer()).get(`/api/tasks/${id}`).expect(200);
      assert.equal(persisted.body.status, 'done');
      assert.equal(persisted.body.title, 'Edited task');
      assert.equal(persisted.body.description, 'Persistent notes');
      const list = await request(app.getHttpServer()).get('/api/tasks').expect(200);
      assert.ok(list.body.some((task: { id: string }) => task.id === id));
      await request(app.getHttpServer())
        .patch(`/api/tasks/${id}`)
        .send({ priority: null })
        .expect(400);
      await request(app.getHttpServer()).get('/api/tasks/not-a-uuid').expect(400);
      const missing = randomUUID();
      await request(app.getHttpServer())
        .patch(`/api/tasks/${missing}`)
        .send({ status: 'done' })
        .expect(404);
      await request(app.getHttpServer()).delete(`/api/tasks/${missing}`).expect(404);
      await request(app.getHttpServer()).delete(`/api/tasks/${id}`).expect(204);
      await request(app.getHttpServer()).get(`/api/tasks/${id}`).expect(404);
      id = undefined;
    } finally {
      if (id) await request(app.getHttpServer()).delete(`/api/tasks/${id}`);
      await app.close();
    }
  },
);
