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

test(
  'labels and attachments persist, download safely, and replace atomically',
  {
    skip: !process.env.DATABASE_URL_TEST,
  },
  async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = module.createNestApplication();
    configureApp(app);
    await app.init();
    const ids: string[] = [];
    const http = () => request(app.getHttpServer());
    const upload = {
      name: 'заметки.txt',
      contentType: 'text/plain',
      dataBase64: Buffer.alloc(2 * 1024 * 1024, 65).toString('base64'),
    };
    try {
      const result = await http()
        .post('/api/tasks')
        .send({ title: 'With attachments', labels: [' design '], attachments: [upload] })
        .expect(201);
      const id = result.body.id as string;
      ids.push(id);
      const fileId = result.body.attachments[0].id as string;
      assert.deepEqual(result.body.labels, ['design']);
      assert.equal(result.body.attachments[0].size, 2 * 1024 * 1024);
      assert.equal(result.body.attachments[0].data, undefined);
      const persisted = await http().get(`/api/tasks/${id}`).expect(200);
      assert.equal(persisted.body.attachments[0].id, fileId);
      const downloaded = await http().get(`/api/tasks/${id}/attachments/${fileId}`).expect(200);
      assert.equal(downloaded.headers['x-content-type-options'], 'nosniff');
      assert.match(downloaded.headers['content-disposition'] as string, /^attachment;/);
      assert.equal(downloaded.body.length, 2 * 1024 * 1024);
      assert.ok(downloaded.body.equals(Buffer.alloc(2 * 1024 * 1024, 65)));
      await http().patch(`/api/tasks/${id}`).send({ title: 'Keep attachments' }).expect(200);
      const kept = await http().get(`/api/tasks/${id}`).expect(200);
      assert.equal(kept.body.attachments.length, 1);
      const other = await http().post('/api/tasks').send({ title: 'Other task' }).expect(201);
      ids.push(other.body.id as string);
      await http()
        .patch(`/api/tasks/${other.body.id}`)
        .send({ attachments: [{ id: fileId }] })
        .expect(400);
      await http().get(`/api/tasks/${other.body.id}/attachments/${fileId}`).expect(404);
      await http()
        .post('/api/tasks')
        .send({ title: 'Invalid reference', attachments: [{ id: fileId }] })
        .expect(400);
      await http()
        .patch(`/api/tasks/${id}`)
        .send({
          title: 'Must not commit',
          attachments: [{ name: 'bad.txt', contentType: 'text/plain', dataBase64: 'not base64!' }],
        })
        .expect(400);
      assert.equal((await http().get(`/api/tasks/${id}`)).body.title, 'Keep attachments');
      await http()
        .patch(`/api/tasks/${id}`)
        .send({ attachments: [{ id: fileId }], labels: ['API'] })
        .expect(200);
      await http().patch(`/api/tasks/${id}`).send({ attachments: [] }).expect(200);
      await http().get(`/api/tasks/${id}/attachments/${fileId}`).expect(404);
      const final = await http().get(`/api/tasks/${id}`).expect(200);
      assert.deepEqual(final.body.attachments, []);
      assert.deepEqual(final.body.labels, ['API']);
    } finally {
      for (const id of ids) await http().delete(`/api/tasks/${id}`);
      await app.close();
    }
  },
);
