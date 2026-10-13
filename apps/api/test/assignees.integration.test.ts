import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

test(
  'assignments persist and comment files survive task attachment replacement',
  { skip: !process.env.DATABASE_URL_TEST },
  async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = module.createNestApplication();
    configureApp(app);
    await app.init();
    const http = () => request(app.getHttpServer());
    const users: string[] = [];
    let taskId: string | undefined;
    try {
      for (const name of ['', ' ', 'x'.repeat(81), null])
        await http().post('/api/users').send({ name }).expect(400);
      const first = await http().post('/api/users').send({ name: '  Test Alice  ' }).expect(201);
      const second = await http().post('/api/users').send({ name: 'Test Bob' }).expect(201);
      users.push(first.body.id as string, second.body.id as string);
      assert.equal(first.body.name, 'Test Alice');
      assert.match(first.body.color as string, /^#[a-f0-9]{6}$/);
      const members = await http().get('/api/users').expect(200);
      assert.ok(members.body.some((member: { id: string }) => member.id === first.body.id));
      await http()
        .post('/api/tasks')
        .send({ title: 'Invalid', assigneeId: randomUUID() })
        .expect(400);
      await http().post('/api/tasks').send({ title: 'Invalid', assigneeId: 'nope' }).expect(400);
      const task = await http()
        .post('/api/tasks')
        .send({ title: 'Assigned', assigneeId: first.body.id })
        .expect(201);
      taskId = task.body.id as string;
      assert.equal(task.body.assignee.name, 'Test Alice');
      await http().patch(`/api/tasks/${taskId}`).send({ assigneeId: randomUUID() }).expect(400);
      const changed = await http()
        .patch(`/api/tasks/${taskId}`)
        .send({ assigneeId: second.body.id })
        .expect(200);
      assert.equal(changed.body.assignee.id, second.body.id);
      const unassigned = await http()
        .patch(`/api/tasks/${taskId}`)
        .send({ assigneeId: null })
        .expect(200);
      assert.equal(unassigned.body.assignee, null);
      assert.equal(unassigned.body.assigneeId, null);
      const upload = {
        name: 'comment.txt',
        contentType: 'text/plain',
        dataBase64: Buffer.from('comment evidence').toString('base64'),
      };
      const comment = await http()
        .post(`/api/tasks/${taskId}/comments`)
        .send({ body: 'See attachment', attachments: [upload] })
        .expect(201);
      const fileId = comment.body.attachments[0].id as string;
      assert.equal(comment.body.attachments[0].data, undefined);
      const current = await http().get(`/api/tasks/${taskId}`).expect(200);
      assert.deepEqual(current.body.attachments, []);
      await http()
        .patch(`/api/tasks/${taskId}`)
        .send({ title: 'Still assigned', attachments: [] })
        .expect(200);
      const download = await http().get(`/api/tasks/${taskId}/attachments/${fileId}`).expect(200);
      assert.equal(download.body.toString(), 'comment evidence');
      await http()
        .patch(`/api/tasks/${taskId}`)
        .send({ attachments: [{ id: fileId }] })
        .expect(400);
      await http()
        .post(`/api/tasks/${taskId}/comments`)
        .send({ body: 'Bad reference', attachments: [{ id: fileId }] })
        .expect(400);
      await http()
        .post(`/api/tasks/${taskId}/comments`)
        .send({ body: 'Bad file', attachments: [{ ...upload, dataBase64: '?' }] })
        .expect(400);
      const activity = await http().get(`/api/tasks/${taskId}/activity`).expect(200);
      assert.ok(
        activity.body.some((event: { message: string }) =>
          event.message.includes('Test Alice → Test Bob'),
        ),
      );
      assert.ok(
        activity.body.some((event: { message: string }) =>
          event.message.includes('Test Bob → Не назначен'),
        ),
      );
      const savedComment = activity.body.find(
        (event: { kind: string }) => event.kind === 'comment',
      );
      assert.equal(savedComment.attachments[0].id, fileId);
      assert.equal(
        activity.body.filter((event: { kind: string }) => event.kind === 'comment').length,
        1,
      );
    } finally {
      if (taskId) await http().delete(`/api/tasks/${taskId}`);
      await module.get(PrismaService).workspaceUser.deleteMany({ where: { id: { in: users } } });
      await app.close();
    }
  },
);
