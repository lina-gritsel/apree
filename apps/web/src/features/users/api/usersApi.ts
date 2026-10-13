import { request } from '../../../shared/api/request';
import type { User } from '../model/types';
export const usersApi = {
  list: (signal?: AbortSignal) => request<User[]>('/api/users', { signal }),
  create: (name: string) =>
    request<User>('/api/users', { method: 'POST', body: JSON.stringify({ name }) }),
};
