import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tasksApi } from '../api/tasksApi';
import { type Task } from './types';
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

describe('writes during an in-flight list request', () => {
  it.each(['save', 'remove'] as const)(
    'cancels the stale read before %s changes the cache',
    async (operation) => {
      const task: Task = {
        id: 'a',
        title: 'Plan',
        description: '',
        status: 'new',
        priority: 'low',
        createdAt: '',
        updatedAt: '',
      };
      let aborted = false;
      vi.spyOn(tasksApi, 'list')
        .mockImplementationOnce(
          (signal) =>
            new Promise((_, reject) => {
              signal?.addEventListener('abort', () => {
                aborted = true;
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockResolvedValue(operation === 'save' ? [task] : []);
      vi.spyOn(tasksApi, 'create').mockImplementation(async () => {
        expect(aborted).toBe(true);
        return task;
      });
      vi.spyOn(tasksApi, 'remove').mockImplementation(async () => {
        expect(aborted).toBe(true);
      });
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      client.setQueryData(['tasks'], [task]);
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result, unmount } = renderHook(() => useTasks(vi.fn()), { wrapper });
      await waitFor(() => expect(result.current.query.isFetching).toBe(true));
      await act(async () => {
        if (operation === 'save') await result.current.save.mutateAsync({ data: task });
        else await result.current.remove.mutateAsync(task.id);
      });
      expect(aborted).toBe(true);
      await waitFor(() => expect(result.current.query.isFetching).toBe(false));
      expect(client.getQueryData<Task[]>(['tasks'])).toEqual(operation === 'save' ? [task] : []);
      unmount();
      client.clear();
    },
  );
});

describe('failed writes during initial load', () => {
  it.each(['save', 'remove'] as const)(
    'restarts the canceled initial query after %s fails',
    async (operation) => {
      const task: Task = {
        id: 'a',
        title: 'Existing',
        description: '',
        status: 'new',
        priority: 'low',
        createdAt: '',
        updatedAt: '',
      };
      vi.spyOn(tasksApi, 'list')
        .mockImplementationOnce(
          (signal) =>
            new Promise((_, reject) => {
              signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        )
        .mockResolvedValue([task]);
      vi.spyOn(tasksApi, 'create').mockRejectedValue(new Error('Write failed'));
      vi.spyOn(tasksApi, 'remove').mockRejectedValue(new Error('Write failed'));
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result, unmount } = renderHook(() => useTasks(vi.fn()), { wrapper });
      await waitFor(() => expect(tasksApi.list).toHaveBeenCalledOnce());
      await act(async () => {
        const mutation =
          operation === 'save'
            ? result.current.save.mutateAsync({ data: task })
            : result.current.remove.mutateAsync(task.id);
        await expect(mutation).rejects.toThrow('Write failed');
      });
      await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
      expect(result.current.query.data).toEqual([task]);
      expect(tasksApi.list).toHaveBeenCalledTimes(2);
      unmount();
      client.clear();
    },
  );
});
