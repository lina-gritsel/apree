import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tasksApi, type Task } from '../api/tasks';
import { useTasks } from './useTasks';
afterEach(() => vi.restoreAllMocks());
describe('optimistic status change', () => {
  it('restores the previous task after a failed request and reports the error', async () => {
    const task: Task = {
      id: 'a',
      title: 'Plan',
      description: '',
      status: 'new',
      priority: 'low',
      createdAt: '',
      updatedAt: '',
    };
    vi.spyOn(tasksApi, 'list').mockResolvedValue([task]);
    let rejectRequest!: (error: Error) => void;
    vi.spyOn(tasksApi, 'update').mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    client.setQueryData(['tasks'], [task]);
    const notify = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useTasks(notify), { wrapper });
    await waitFor(() => expect(result.current.query.isFetching).toBe(false));
    act(() => result.current.move.mutate({ id: 'a', status: 'done' }));
    await waitFor(() => expect(client.getQueryData<Task[]>(['tasks'])?.[0].status).toBe('done'));
    act(() => rejectRequest(new Error('offline')));
    await waitFor(() => expect(result.current.move.isError).toBe(true));
    expect(client.getQueryData<Task[]>(['tasks'])?.[0].status).toBe('new');
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('Вернули'), true);
    client.clear();
  });
});

describe('confirmed mutations when refetch fails', () => {
  it('keeps created and edited tasks in cache, then removes the deleted task', async () => {
    const task: Task = {
      id: 'saved',
      title: 'Saved',
      description: '',
      status: 'new',
      priority: 'medium',
      createdAt: '',
      updatedAt: '',
    };
    vi.spyOn(tasksApi, 'list').mockResolvedValueOnce([]).mockRejectedValue(new Error('offline'));
    vi.spyOn(tasksApi, 'create').mockResolvedValue(task);
    vi.spyOn(tasksApi, 'update').mockResolvedValue({ ...task, title: 'Edited' });
    vi.spyOn(tasksApi, 'remove').mockResolvedValue(undefined);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useTasks(vi.fn()), { wrapper });
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await result.current.save.mutateAsync({ data: task });
    });
    await waitFor(() => expect(result.current.query.isFetching).toBe(false));
    expect(client.getQueryData<Task[]>(['tasks'])).toEqual([task]);
    await act(async () => {
      await result.current.save.mutateAsync({ id: task.id, data: { ...task, title: 'Edited' } });
    });
    await waitFor(() => expect(result.current.query.isFetching).toBe(false));
    expect(client.getQueryData<Task[]>(['tasks'])?.[0].title).toBe('Edited');
    await act(async () => {
      await result.current.remove.mutateAsync(task.id);
    });
    await waitFor(() => expect(result.current.query.isFetching).toBe(false));
    expect(client.getQueryData<Task[]>(['tasks'])).toEqual([]);
    client.clear();
  });
});
