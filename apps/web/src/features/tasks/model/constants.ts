import type { Status, Priority } from './types';
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
