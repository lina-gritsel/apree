import { Task } from '@prisma/client';

type TaskSnapshot = Task & {
  attachments: { id: string; name: string }[];
  assignee?: { name: string } | null;
};
const statuses = { new: 'Новая', in_progress: 'В работе', done: 'Готово' };
const priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export function describeChanges(before: TaskSnapshot, after: TaskSnapshot): string {
  const changes: string[] = [];
  if (before.assigneeId !== after.assigneeId)
    changes.push(
      `Исполнитель: ${before.assignee?.name ?? 'Не назначен'} → ${after.assignee?.name ?? 'Не назначен'}`,
    );
  if (before.title !== after.title) changes.push(`Название: «${before.title}» → «${after.title}»`);
  if (before.status !== after.status)
    changes.push(`Статус: ${statuses[before.status]} → ${statuses[after.status]}`);
  if (before.priority !== after.priority)
    changes.push(`Приоритет: ${priorities[before.priority]} → ${priorities[after.priority]}`);
  if (before.description !== after.description)
    changes.push(after.description ? 'Описание обновлено' : 'Описание удалено');
  const addedLabels = after.labels.filter((label) => !before.labels.includes(label));
  const removedLabels = before.labels.filter((label) => !after.labels.includes(label));
  if (addedLabels.length) changes.push(`Добавлены метки: ${addedLabels.join(', ')}`);
  if (removedLabels.length) changes.push(`Удалены метки: ${removedLabels.join(', ')}`);
  const addedFiles = after.attachments.filter(
    (file) => !before.attachments.some((old) => old.id === file.id),
  );
  const removedFiles = before.attachments.filter(
    (file) => !after.attachments.some((current) => current.id === file.id),
  );
  if (addedFiles.length)
    changes.push(`Добавлены файлы: ${addedFiles.map((file) => file.name).join(', ')}`);
  if (removedFiles.length)
    changes.push(`Удалены файлы: ${removedFiles.map((file) => file.name).join(', ')}`);
  return changes.join('; ');
}
