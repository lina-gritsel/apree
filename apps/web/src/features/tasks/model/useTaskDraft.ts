import { useEffect, useRef, useState } from 'react';
import type { Task, TaskInput } from './types';
import { attachmentPayload, type DraftAttachment } from './attachments';

function taskFields(task: Task) {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    labels: task.labels ?? [],
    assigneeId: task.assigneeId ?? task.assignee?.id ?? null,
  };
}

export function useTaskDraft(
  task: Task,
  onSave: (data: TaskInput, id: string) => Promise<Task>,
  pending: boolean,
) {
  const [draft, setDraft] = useState(() => taskFields(task));
  const [files, setFiles] = useState<DraftAttachment[]>(task.attachments ?? []);
  const [baseline, setBaseline] = useState(JSON.stringify({ draft, files }));
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const submitting = useRef(false);
  const dirty = JSON.stringify({ draft, files }) !== baseline;
  const disabled = pending || reading;
  useEffect(() => {
    if (dirty || reading || pending) return;
    const incomingDraft = taskFields(task);
    const incomingFiles = task.attachments ?? [];
    const incoming = JSON.stringify({ draft: incomingDraft, files: incomingFiles });
    if (incoming === baseline) return;
    setDraft(incomingDraft);
    setFiles(incomingFiles);
    setBaseline(incoming);
  }, [task, dirty, reading, pending, baseline]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current || disabled) return;
    setAttempted(true);
    setError('');
    if (!draft.title.trim()) return;
    submitting.current = true;
    try {
      const normalized = {
        ...draft,
        title: draft.title.trim(),
        description: draft.description.trim(),
      };
      const saved = await onSave({ ...normalized, attachments: attachmentPayload(files) }, task.id);
      const savedFiles = saved.attachments ?? [];
      const savedDraft = taskFields(saved);
      setDraft(savedDraft);
      setFiles(savedFiles);
      setBaseline(JSON.stringify({ draft: savedDraft, files: savedFiles }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Не удалось сохранить изменения.');
    } finally {
      submitting.current = false;
    }
  }
  return {
    draft,
    setDraft,
    files,
    setFiles,
    reading,
    setReading,
    error,
    setError,
    attempted,
    dirty,
    disabled,
    submit,
  };
}
