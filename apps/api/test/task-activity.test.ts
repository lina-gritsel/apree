import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeChanges, type TaskSnapshot } from '../src/tasks/task-activity';

const before: TaskSnapshot = {
  assigneeId: null,
  title: 'Plan',
  description: 'Old',
  status: 'new',
  priority: 'low',
  labels: ['design'],
  attachments: [{ id: 'old', name: 'old.txt' }],
};

test('mixed changes preserve exact messages and ordering', () => {
  const message = describeChanges(before, {
    ...before,
    assigneeId: 'user',
    assignee: { name: 'Alice' },
    title: 'Build',
    description: 'New',
    status: 'done',
    priority: 'high',
    labels: ['API'],
    attachments: [{ id: 'new', name: 'new.txt' }],
  });
  assert.equal(
    message,
    [
      'Исполнитель: Не назначен → Alice',
      'Название: «Plan» → «Build»',
      'Статус: Новая → Готово',
      'Приоритет: Низкий → Высокий',
      'Описание обновлено',
      'Добавлены метки: API',
      'Удалены метки: design',
      'Добавлены файлы: new.txt',
      'Удалены файлы: old.txt',
    ].join('; '),
  );
});

test('no-op updates and collection reordering do not manufacture activity', () => {
  const task = {
    ...before,
    labels: ['design', 'API'],
    attachments: [
      { id: 'a', name: 'a.txt' },
      { id: 'b', name: 'b.txt' },
    ],
  };
  assert.equal(describeChanges(task, task), '');
  assert.equal(
    describeChanges(task, {
      ...task,
      labels: [...task.labels].reverse(),
      attachments: [...task.attachments].reverse(),
    }),
    '',
  );
});

test('replacement uses file and assignee identity even when names match', () => {
  const task = { ...before, assigneeId: 'first', assignee: { name: 'Alex' } };
  assert.equal(
    describeChanges(task, {
      ...task,
      assigneeId: 'second',
      attachments: [{ id: 'replacement', name: 'old.txt' }],
    }),
    'Исполнитель: Alex → Alex; Добавлены файлы: old.txt; Удалены файлы: old.txt',
  );
});

test('clearing description and assignee preserves removal messages', () => {
  const task = { ...before, assigneeId: 'first', assignee: { name: 'Alex' } };
  assert.equal(
    describeChanges(task, { ...task, assigneeId: null, assignee: null, description: '' }),
    'Исполнитель: Alex → Не назначен; Описание удалено',
  );
});
