import { request } from '../../../shared/api/request';
import type { Task, TaskInput, ActivityEvent, AttachmentInput } from '../model/types';
export const tasksApi = {
  activity: (id: string, signal?: AbortSignal) =>
    request<ActivityEvent[]>('/api/tasks/' + id + '/activity', { signal }),
  comment: (id: string, body: string, attachments?: AttachmentInput[]) =>
    request<ActivityEvent>('/api/tasks/' + id + '/comments', {
      method: 'POST',
      body: JSON.stringify({ body, attachments }),
    }),
  list: (signal?: AbortSignal) => request<Task[]>('/api/tasks', { signal }),
  create: (task: TaskInput) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id: string, task: Partial<TaskInput>) =>
    request<Task>('/api/tasks/' + id, { method: 'PATCH', body: JSON.stringify(task) }),
  remove: (id: string) => request<void>('/api/tasks/' + id, { method: 'DELETE' }),
};
