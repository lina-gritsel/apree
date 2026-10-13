import type { Priority, Status } from '@prisma/client';

export interface TaskSnapshot {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  assignee?: { name: string } | null;
  labels: readonly string[];
  attachments: readonly { id: string; name: string }[];
}

const statusLabels: Record<Status, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готово',
};
const priorityLabels: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export function describeChanges(before: TaskSnapshot, after: TaskSnapshot): string {
  return [
    describeAssigneeChange(before, after),
    describeValueChange('Название', `«${before.title}»`, `«${after.title}»`),
    describeValueChange('Статус', statusLabels[before.status], statusLabels[after.status]),
    describeValueChange(
      'Приоритет',
      priorityLabels[before.priority],
      priorityLabels[after.priority],
    ),
    describeDescriptionChange(before.description, after.description),
    ...describeLabelChanges(before.labels, after.labels),
    ...describeFileChanges(before.attachments, after.attachments),
  ]
    .filter(Boolean)
    .join('; ');
}

function describeValueChange(label: string, before: string, after: string): string {
  return before === after ? '' : `${label}: ${before} → ${after}`;
}

function describeAssigneeChange(before: TaskSnapshot, after: TaskSnapshot): string {
  if (before.assigneeId === after.assigneeId) return '';
  const previousName = before.assignee?.name ?? 'Не назначен';
  const currentName = after.assignee?.name ?? 'Не назначен';
  return `Исполнитель: ${previousName} → ${currentName}`;
}

function describeDescriptionChange(before: string, after: string): string {
  if (before === after) return '';
  return after ? 'Описание обновлено' : 'Описание удалено';
}

function describeLabelChanges(before: readonly string[], after: readonly string[]): string[] {
  const { added, removed } = collectionDifference(before, after, (label) => label);
  return describeCollectionChanges('метки', added, removed);
}

function describeFileChanges(
  before: TaskSnapshot['attachments'],
  after: TaskSnapshot['attachments'],
): string[] {
  const { added, removed } = collectionDifference(before, after, (file) => file.id);
  return describeCollectionChanges(
    'файлы',
    added.map((file) => file.name),
    removed.map((file) => file.name),
  );
}

function describeCollectionChanges(
  label: string,
  added: readonly string[],
  removed: readonly string[],
): string[] {
  return [
    added.length ? `Добавлены ${label}: ${added.join(', ')}` : '',
    removed.length ? `Удалены ${label}: ${removed.join(', ')}` : '',
  ];
}

function collectionDifference<T>(
  before: readonly T[],
  after: readonly T[],
  key: (item: T) => string,
) {
  const previousKeys = new Set(before.map(key));
  const currentKeys = new Set(after.map(key));
  return {
    added: after.filter((item) => !previousKeys.has(key(item))),
    removed: before.filter((item) => !currentKeys.has(key(item))),
  };
}
