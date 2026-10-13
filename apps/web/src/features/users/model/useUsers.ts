import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import type { User } from './types';

export function useUsers(onCreated: (user: User) => void) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['users'], queryFn: ({ signal }) => usersApi.list(signal) });
  const create = useMutation({
    mutationFn: usersApi.create,
    onMutate: () => client.cancelQueries({ queryKey: ['users'] }),
    onSuccess: (created) => {
      client.setQueryData<User[]>(['users'], (users) => [
        ...(users ?? []).filter((user) => user.id !== created.id),
        created,
      ]);
      onCreated(created);
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['users'] }),
  });
  return { query, create };
}
