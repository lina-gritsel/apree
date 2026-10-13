import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usersApi } from '../api/usersApi';
import { useUsers } from './useUsers';
afterEach(() => vi.restoreAllMocks());

describe('member creation during initial load', () => {
  it.each([true, false])(
    'restores the complete member list after creation success=%s',
    async (succeeds) => {
      const existing = { id: 'one', name: 'Existing', color: '#555555' };
      const created = { id: 'two', name: 'Created', color: '#666666' };
      const members = succeeds ? [existing, created] : [existing];
      vi.spyOn(usersApi, 'list')
        .mockImplementationOnce(
          (signal) =>
            new Promise((_, reject) => {
              signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        )
        .mockResolvedValue(members);
      const create = vi.spyOn(usersApi, 'create');
      if (succeeds) create.mockResolvedValue(created);
      else create.mockRejectedValue(new Error('Write failed'));
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result, unmount } = renderHook(() => useUsers(vi.fn()), { wrapper });
      await waitFor(() => expect(usersApi.list).toHaveBeenCalledOnce());
      await act(async () => {
        const mutation = result.current.create.mutateAsync(created.name);
        if (succeeds) await mutation;
        else await expect(mutation).rejects.toThrow('Write failed');
      });
      await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
      expect(result.current.query.data).toEqual(members);
      expect(usersApi.list).toHaveBeenCalledTimes(2);
      unmount();
      client.clear();
    },
  );
});
