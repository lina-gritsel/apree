import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ValidationPipe } from '@nestjs/common';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto';

const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
const create = (value: unknown) => pipe.transform(value, { type: 'body', metatype: CreateTaskDto });
const update = (value: unknown) => pipe.transform(value, { type: 'body', metatype: UpdateTaskDto });

test('creation trims title and preserves description', async () => {
  const task = await create({ title: '  Focus  ', description: ' Notes ' });
  assert.equal(task.title, 'Focus');
  assert.equal(task.description, ' Notes ');
});

test('rejects empty, oversized, unknown, null and invalid fields at the boundary', async () => {
  for (const body of [
    {},
    { title: '  ' },
    { title: 12 },
    { title: 'a'.repeat(161) },
    { title: 'Focus', description: 'a'.repeat(5001) },
    { title: 'Focus', priority: 'urgent' },
    { title: 'Focus', status: 'archived' },
    { title: 'Focus', description: null },
    { title: 'Focus', id: 'injected' },
  ]) {
    await assert.rejects(create(body));
  }
});

test('partial update allows omission, rejects null, and validates status', async () => {
  assert.equal((await update({ status: 'done' })).status, 'done');
  for (const field of ['title', 'description', 'priority', 'status']) {
    await assert.rejects(update({ [field]: null }));
  }
  await assert.rejects(update({ title: ' ' }));
  await assert.rejects(update({ status: 'invalid' }));
});

test('labels normalize whitespace and reject duplicates and invalid attachment arrays', async () => {
  assert.deepEqual((await create({ title: 'Task', labels: [' design ', 'API'] })).labels, [
    'design',
    'API',
  ]);
  for (const labels of [
    null,
    [''],
    ['  '],
    ['a', ' a '],
    ['a'.repeat(31)],
    ['1', '2', '3', '4', '5', '6'],
  ]) {
    await assert.rejects(create({ title: 'Task', labels }));
  }
  for (const attachments of [
    null,
    [null],
    [1],
    [{ extra: true }],
    [{ id: 'invalid' }],
    [{ name: null }],
    [{}, {}, {}, {}],
  ]) {
    await assert.rejects(create({ title: 'Task', attachments }));
  }
});
