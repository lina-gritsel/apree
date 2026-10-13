import { describe, expect, it } from 'vitest';
import { filterTasks } from './filterTasks';
import { type Task } from './types';
const tasks: Task[] = [
  {
    id: 'one',
    title: 'Собрать прототип',
    description: 'Проверить мобильную версию',
    priority: 'high',
    status: 'new',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'two',
    title: 'Обновить документацию',
    description: '',
    priority: 'low',
    status: 'done',
    createdAt: '',
    updatedAt: '',
  },
];
describe('task search', () => {
  it('combines case-insensitive title or description search with priority', () => {
    expect(filterTasks(tasks, ' МОБИЛЬНУЮ ', 'high')).toEqual([tasks[0]]);
    expect(filterTasks(tasks, 'мобильную', 'low')).toEqual([]);
    expect(filterTasks(tasks, 'ДОКУМЕНТАЦИЮ', 'all')).toEqual([tasks[1]]);
  });
});
