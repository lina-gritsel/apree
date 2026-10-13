import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi';
import { type Task, type TaskInput, type Status } from './types';
export function useTasks(notify: (message: string, error?: boolean) => void) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['tasks'], queryFn: ({ signal }) => tasksApi.list(signal) });
  const refresh = () => client.invalidateQueries({ queryKey: ['tasks'] });
  const save = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: TaskInput }) =>
      id ? tasksApi.update(id, data) : tasksApi.create(data),
    onMutate: () => client.cancelQueries({ queryKey: ['tasks'] }),
    onSuccess: (saved, input) => {
      client.setQueryData<Task[]>(['tasks'], (tasks = []) =>
        input.id ? tasks.map((task) => (task.id === saved.id ? saved : task)) : [saved, ...tasks],
      );
      notify(input.id ? 'Изменения сохранены' : 'Задача создана');
    },
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: tasksApi.remove,
    onMutate: () => client.cancelQueries({ queryKey: ['tasks'] }),
    onSuccess: (_, id) => {
      client.setQueryData<Task[]>(['tasks'], (tasks) => tasks?.filter((task) => task.id !== id));
      notify('Задача удалена');
    },
    onSettled: refresh,
  });
  const move = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) => tasksApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await client.cancelQueries({ queryKey: ['tasks'] });
      const previous = client.getQueryData<Task[]>(['tasks'])?.find((task) => task.id === id);
      client.setQueryData<Task[]>(['tasks'], (tasks) =>
        tasks?.map((task) => (task.id === id ? { ...task, status } : task)),
      );
      return { previous };
    },
    onError: (_, { id }, context) => {
      if (context?.previous)
        client.setQueryData<Task[]>(['tasks'], (tasks) =>
          tasks?.map((task) => (task.id === id ? context.previous! : task)),
        );
      notify('Не удалось переместить задачу. Вернули её на прежнее место.', true);
    },
    onSettled: refresh,
  });
  return { query, save, remove, move };
}
