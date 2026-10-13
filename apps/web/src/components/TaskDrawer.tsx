import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import {
  priorities,
  statuses,
  type Task,
  type TaskInput,
  type Status,
  type Priority,
} from '../api/tasks';
interface Props {
  task?: Task;
  status: Status;
  onClose: () => void;
  onSave: (data: TaskInput, id?: string) => Promise<unknown>;
  onDelete: (task: Task) => void;
  pending: boolean;
}
export function TaskDrawer({ task, status, onClose, onSave, onDelete, pending }: Props) {
  const submitting = useRef(false);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [selectedStatus, setStatus] = useState<Status>(task?.status ?? status);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty =
    title !== (task?.title ?? '') ||
    description !== (task?.description ?? '') ||
    priority !== (task?.priority ?? 'medium') ||
    selectedStatus !== (task?.status ?? status);
  const close = () => {
    if (pending) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current || pending) return;
    setAttempted(true);
    setError('');
    if (!title.trim()) return;
    submitting.current = true;
    try {
      await onSave(
        { title: title.trim(), description: description.trim(), priority, status: selectedStatus },
        task?.id,
      );
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Не удалось сохранить. Попробуйте ещё раз.',
      );
    } finally {
      submitting.current = false;
    }
  }
  return (
    <Drawer
      anchor="right"
      open
      onClose={close}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-label': task ? 'Задача' : 'Новая задача',
          'aria-modal': true,
          sx: { width: { xs: '100%', sm: 480 }, p: { xs: 2.5, sm: 4 } },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontSize: 10,
            letterSpacing: 1.5,
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {task ? 'TSK-' + task.id.slice(-6).toUpperCase() : 'Задачи'}
        </Typography>
        <IconButton aria-label="Закрыть" onClick={close} disabled={pending}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="h5" sx={{ mb: 0.8 }}>
        {task ? 'Редактирование задачи' : 'Новая задача'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {task
          ? 'Всё важное, чтобы двигаться дальше.'
          : 'Освободите голову. Запишите то, что важно.'}
      </Typography>
      <Box
        component="form"
        onSubmit={submit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        {confirmClose && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={onClose}>
                Закрыть без сохранения
              </Button>
            }
          >
            Есть несохранённые изменения.
          </Alert>
        )}
        <TextField
          autoFocus
          label="Название"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          error={attempted && !title.trim()}
          helperText={
            attempted && !title.trim() ? 'Введите название задачи' : title.length + ' / 160'
          }
          slotProps={{ htmlInput: { maxLength: 160 } }}
          fullWidth
          multiline
          maxRows={4}
          disabled={pending}
        />
        <TextField
          label="Описание"
          placeholder="Контекст, детали и желаемый результат…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          minRows={5}
          maxRows={12}
          slotProps={{ htmlInput: { maxLength: 5000 } }}
          helperText={description.length ? description.length + ' / 5000' : 'Необязательно'}
          disabled={pending}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            select
            label="Статус"
            value={selectedStatus}
            onChange={(event) => setStatus(event.target.value as Status)}
            disabled={pending}
          >
            {statuses.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Приоритет"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            disabled={pending}
          >
            {Object.entries(priorities).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        {task && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
            Создана{' '}
            {new Intl.DateTimeFormat('ru', { dateStyle: 'long', timeStyle: 'short' }).format(
              new Date(task.createdAt),
            )}
          </Typography>
        )}
        <Box sx={{ flex: 1, minHeight: 24 }} />
        <Divider />
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', pb: 1 }}>
          {task && (
            <IconButton
              color="error"
              aria-label="Удалить задачу"
              disabled={pending}
              onClick={() => onDelete(task)}
            >
              <DeleteOutlineRounded />
            </IconButton>
          )}
          <Button onClick={close} color="inherit" disabled={pending}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={pending}
            endIcon={!pending && <ArrowForwardRounded />}
            sx={{ ml: 'auto' }}
          >
            {pending ? 'Сохраняем…' : task ? 'Сохранить изменения' : 'Создать задачу'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
