import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Divider, TextField, Typography } from '@mui/material';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { type Task, type TaskInput } from '../api/tasks';
import { TaskProperties } from './TaskProperties';
import {
  AttachmentButton,
  AttachmentList,
  attachmentPayload,
  type DraftAttachment,
} from './TaskAttachments';
import { TaskActivity } from './TaskActivity';

interface Props {
  task: Task;
  onSave: (data: TaskInput, id?: string) => Promise<unknown>;
  onDelete: (task: Task) => void;
  pending: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}
export function TaskPage({ task, onSave, onDelete, pending, onDirtyChange }: Props) {
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    labels: task.labels ?? [],
    assigneeId: task.assigneeId ?? task.assignee?.id ?? null,
  });
  const [files, setFiles] = useState<DraftAttachment[]>(task.attachments ?? []);
  const [baseline, setBaseline] = useState(JSON.stringify({ draft, files }));
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [commentDirty, setCommentDirty] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const submitting = useRef(false);
  const dirty = JSON.stringify({ draft, files }) !== baseline;
  const disabled = pending || reading;
  useEffect(() => {
    onDirtyChange?.(dirty || commentDirty);
  }, [dirty, commentDirty, onDirtyChange]);
  useEffect(() => {
    if (dirty || reading || pending) return;
    const incomingDraft = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      labels: task.labels ?? [],
      assigneeId: task.assigneeId ?? task.assignee?.id ?? null,
    };
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
      const savedFiles =
        saved && typeof saved === 'object' && 'attachments' in saved
          ? ((saved as Task).attachments ?? [])
          : files;
      setDraft(normalized);
      setFiles(savedFiles);
      setBaseline(JSON.stringify({ draft: normalized, files: savedFiles }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Не удалось сохранить изменения.');
    } finally {
      submitting.current = false;
    }
  }
  return (
    <Box
      data-testid="task-page"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 240px' },
        minHeight: 0,
        flex: 1,
        overflowY: 'auto',
        alignContent: 'start',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: { xs: 'contents', md: 'block' },
          width: '100%',
          maxWidth: 820,
          mx: 'auto',
          px: { xs: 2.5, md: 5, lg: 7 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Box
          component="form"
          onSubmit={submit}
          id="task-edit-form"
          sx={{ px: { xs: 2.5, md: 0 }, pt: { xs: 3, md: 0 } }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            variant="standard"
            value={draft.title}
            placeholder="Название задачи"
            disabled={disabled}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            fullWidth
            multiline
            maxRows={5}
            required
            error={attempted && !draft.title.trim()}
            helperText={attempted && !draft.title.trim() ? 'Введите название задачи' : undefined}
            slotProps={{
              input: { disableUnderline: true },
              htmlInput: { 'aria-label': 'Название', maxLength: 160 },
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: 26,
                fontWeight: 550,
                lineHeight: 1.45,
                letterSpacing: '-.5px',
              },
            }}
          />
          <TextField
            variant="standard"
            value={draft.description}
            placeholder="Добавьте описание…"
            disabled={disabled}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            fullWidth
            multiline
            minRows={4}
            maxRows={18}
            slotProps={{
              input: { disableUnderline: true },
              htmlInput: { 'aria-label': 'Описание', maxLength: 5000 },
            }}
            sx={{ mt: 2, '& .MuiInputBase-input': { fontSize: 14, lineHeight: 1.8 } }}
          />
          {!!files.length && (
            <Box sx={{ mt: 2 }}>
              <AttachmentList
                files={files}
                taskId={task.id}
                onChange={setFiles}
                disabled={disabled}
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 1 }}>
            <AttachmentButton
              files={files}
              onChange={setFiles}
              onError={setError}
              onReading={setReading}
              disabled={disabled}
            />
            {dirty && (
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={disabled}
                sx={{ ml: 'auto' }}
              >
                {pending ? 'Сохраняем…' : 'Сохранить изменения'}
              </Button>
            )}
          </Box>
        </Box>
        <Box sx={{ order: { xs: 2, md: 0 }, px: { xs: 2.5, md: 0 }, pb: 3 }}>
          <TaskActivity
            taskId={task.id}
            createdAt={task.createdAt}
            updatedAt={task.updatedAt}
            onDirtyChange={setCommentDirty}
          />
        </Box>
      </Box>
      <Box
        component="aside"
        aria-label="Свойства задачи"
        data-testid="task-properties"
        sx={{
          order: { xs: 1, md: 0 },
          position: { md: 'sticky' },
          top: { md: 24 },
          alignSelf: 'start',
          borderStyle: 'solid',
          borderLeftWidth: 0,
          borderTopWidth: { xs: 1, md: 0 },
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderColor: 'divider',
          px: 2.5,
          py: 3.5,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 2 }}>Свойства</Typography>
        <TaskProperties
          vertical
          assigneeId={draft.assigneeId}
          assignee={task.assignee}
          onAssignee={(assigneeId) => setDraft({ ...draft, assigneeId })}
          status={draft.status}
          priority={draft.priority}
          labels={draft.labels}
          disabled={disabled}
          onStatus={(status) => setDraft({ ...draft, status })}
          onPriority={(priority) => setDraft({ ...draft, priority })}
          onLabels={(labels) => setDraft({ ...draft, labels })}
        />
        <Divider sx={{ my: 3 }} />
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>Проект</Typography>
        <Typography sx={{ fontSize: 13 }}>Apri</Typography>
        <Divider sx={{ my: 3 }} />
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          Создана{' '}
          {new Intl.DateTimeFormat('ru', { dateStyle: 'medium' }).format(new Date(task.createdAt))}
        </Typography>
        <Button
          startIcon={<DeleteOutlineRounded sx={{ fontSize: 16 }} />}
          color="inherit"
          size="small"
          aria-label="Удалить задачу"
          onClick={() => onDelete(task)}
          disabled={disabled}
          sx={{ mt: 3, color: 'text.secondary', px: 0 }}
        >
          Удалить задачу
        </Button>
      </Box>
    </Box>
  );
}
