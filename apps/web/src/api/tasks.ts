export type Status = 'new' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}
export type TaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'status'>;
export const statuses: { value: Status; label: string; color: string; hint: string }[] = [
  {
    value: 'new',
    label: 'Новая',
    color: '#8c91a4',
    hint: 'Создайте задачу или перенесите её сюда',
  },
  {
    value: 'in_progress',
    label: 'В работе',
    color: '#6661e9',
    hint: 'Перенесите сюда задачи, над которыми работаете',
  },
  { value: 'done', label: 'Готово', color: '#32977a', hint: 'Завершённые задачи появятся здесь' },
];
export const priorities: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};
async function request<T>(path = '', options?: RequestInit): Promise<T> {
  const response = await fetch('/api/tasks' + path, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.');
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
    throw new Error(message || 'Не удалось связаться с сервером. Попробуйте ещё раз.');
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}
export const tasksApi = {
  list: (signal?: AbortSignal) => request<Task[]>('', { signal }),
  create: (task: TaskInput) => request<Task>('', { method: 'POST', body: JSON.stringify(task) }),
  update: (id: string, task: Partial<TaskInput>) =>
    request<Task>('/' + id, { method: 'PATCH', body: JSON.stringify(task) }),
  remove: (id: string) => request<void>('/' + id, { method: 'DELETE' }),
};
export function filterTasks(tasks: Task[], search: string, priority: Priority | 'all') {
  const term = search.trim().toLocaleLowerCase('ru');
  return tasks.filter(
    (task) =>
      (priority === 'all' || task.priority === priority) &&
      (task.title + ' ' + task.description).toLocaleLowerCase('ru').includes(term),
  );
}
