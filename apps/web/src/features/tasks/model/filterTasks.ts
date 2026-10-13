import type { Task, Priority } from './types';
export function filterTasks(tasks: Task[], search: string, priority: Priority | 'all') {
  const term = search.trim().toLocaleLowerCase('ru');
  return tasks.filter(
    (task) =>
      (priority === 'all' || task.priority === priority) &&
      (task.title + ' ' + task.description).toLocaleLowerCase('ru').includes(term),
  );
}
