import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Task } from '@prisma/client';
import { describeChanges } from '../src/tasks/task-activity';

const before: Task & { attachments: { id: string; name: string }[] } = {
  id: 'task',
  assigneeId: null,
  title: 'Plan',
  description: 'Old',
  status: 'new',
  priority: 'low',
  labels: ['design'],
  createdAt: new Date(),
  updatedAt: new Date(),
  attachments: [{ id: 'old', name: 'old.txt' }],
};

test('activity summarizes every meaningful editable field', () => {
  const message = describeChanges(before, {
    ...before,
    title: 'Build',
    description: 'New',
    status: 'done',
    priority: 'high',
    labels: ['API'],
    attachments: [{ id: 'new', name: 'new.txt' }],
  });
  for (const part of [
    '«Plan» → «Build»',
    'Новая → Готово',
    'Низкий → Высокий',
    'Описание обновлено',
    'Добавлены метки: API',
    'Удалены метки: design',
    'Добавлены файлы: new.txt',
    'Удалены файлы: old.txt',
  ]) {
    assert.ok(message.includes(part), part);
  }
});

test('no-op updates do not manufacture activity', () => {
  assert.equal(describeChanges(before, { ...before, updatedAt: new Date() }), '');
});
