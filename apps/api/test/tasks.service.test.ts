import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { TasksService } from '../src/tasks/tasks.service';

function serviceWith(task: object, workspaceUser: object = {}) {
  return new TasksService({
    task,
    workspaceUser,
    $transaction: async (callback: (tx: object) => Promise<unknown>) =>
      callback({ task, workspaceUser, $queryRaw: async () => [] }),
  } as unknown as PrismaService);
}

test('a missing task returns 404 for reads', async () => {
  const service = serviceWith({ findUnique: async () => null });
  await assert.rejects(service.findOne('missing'), NotFoundException);
});

test('concurrent deletion returns 404 on update and delete', async () => {
  const missing = async () => {
    throw new Prisma.PrismaClientKnownRequestError('missing', {
      code: 'P2025',
      clientVersion: '6',
    });
  };
  const service = serviceWith({ findUnique: missing, delete: missing });
  await assert.rejects(service.update('missing', { status: 'done' }), NotFoundException);
  await assert.rejects(service.remove('missing'), NotFoundException);
});

test('database failures are not misrepresented as missing tasks', async () => {
  const failure = new Error('database offline');
  const service = serviceWith({
    findUnique: async () => {
      throw failure;
    },
  });
  await assert.rejects(service.update('id', {}), (error) => error === failure);
});

test('assignee deleted between validation and write returns a client error', async () => {
  const failure = new Prisma.PrismaClientKnownRequestError('foreign key failed', {
    code: 'P2003',
    clientVersion: '6',
    meta: { field_name: 'Task_assigneeId_fkey (index)' },
  });
  const failWrite = async () => {
    throw failure;
  };
  const service = serviceWith(
    { create: failWrite, update: failWrite, findUnique: async () => ({ attachments: [] }) },
    {
      findUnique: async () => ({ id: 'assignee' }),
    },
  );
  await assert.rejects(
    service.create({ title: 'Task', assigneeId: 'assignee' }),
    BadRequestException,
  );
  await assert.rejects(service.update('task', { assigneeId: 'assignee' }), BadRequestException);
});
