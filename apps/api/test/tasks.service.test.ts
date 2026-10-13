import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { TasksService } from '../src/tasks/tasks.service';

function serviceWith(task: object) {
  return new TasksService({ task } as PrismaService);
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
  const service = serviceWith({ update: missing, delete: missing });
  await assert.rejects(service.update('missing', { status: 'done' }), NotFoundException);
  await assert.rejects(service.remove('missing'), NotFoundException);
});

test('database failures are not misrepresented as missing tasks', async () => {
  const failure = new Error('database offline');
  const service = serviceWith({
    update: async () => {
      throw failure;
    },
  });
  await assert.rejects(service.update('id', {}), (error) => error === failure);
});
