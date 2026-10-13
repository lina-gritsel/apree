import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { attachmentPayload, type DraftAttachment } from '../../model/attachments';
import { type Task, type TaskInput, type Status, type Priority } from '../../model/types';
import { TaskProperties } from '../shared/TaskProperties';
import { AttachmentButton, AttachmentList } from '../shared/TaskAttachments';
interface Props {
  status: Status;
  onClose: () => void;
  onSave: (data: TaskInput) => Promise<Task>;
  pending: boolean;
}
export function TaskDialog({ status, onClose, onSave, pending }: Props) {
  const submitting = useRef(false);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status,
    assigneeId: null as string | null,
    labels: [] as string[],
  });
  const { title, description, priority, status: selectedStatus, assigneeId, labels } = draft;
  const [files, setFiles] = useState<DraftAttachment[]>([]);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const disabled = pending || reading;
  const dirty =
    title !== '' ||
    description !== '' ||
    priority !== 'medium' ||
    selectedStatus !== status ||
    assigneeId !== null ||
    labels.length > 0 ||
    files.length > 0;
  const close = () => {
    if (disabled) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current || disabled) return;
    setAttempted(true);
    setError('');
    if (!title.trim()) return;
    submitting.current = true;
    try {
      await onSave({
        ...draft,
        title: title.trim(),
        description: description.trim(),
        attachments: attachmentPayload(files),
      });
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Не удалось сохранить. Попробуйте ещё раз.',
      );
    } finally {
      submitting.current = false;
    }
  }
  const borderless = {
    '& .MuiInputBase-root': { bgcolor: 'transparent' },
    '& .MuiInputBase-input::placeholder': { opacity: 1, color: 'text.secondary' },
  };
  return (
    <Dialog
      open
      onClose={close}
      aria-label="Новая задача"
      maxWidth={false}
      scroll="paper"
      slotProps={{
        container: { sx: { alignItems: { xs: 'center', sm: 'flex-start' } } },
        paper: {
          sx: {
            width: 760,
            maxWidth: 'calc(100% - 32px)',
            m: { xs: 2, sm: '18vh 24px 24px' },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            boxShadow: '0 24px 100px #0008',
          },
        },
      }}
    >
      <Box component="form" onSubmit={submit} noValidate>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Apri</Typography>
          <ChevronRightRounded sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Новая задача</Typography>
          <IconButton
            aria-label="Закрыть"
            size="small"
            onClick={close}
            disabled={disabled}
            sx={{ ml: 'auto', color: 'text.secondary' }}
          >
            <CloseRounded sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {confirmClose && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
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
            placeholder="Название задачи"
            value={title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            required
            error={attempted && !title.trim()}
            helperText={
              attempted && !title.trim()
                ? 'Введите название задачи'
                : title.length >= 150
                  ? title.length + ' / 160'
                  : undefined
            }
            variant="standard"
            slotProps={{
              input: { disableUnderline: true },
              htmlInput: { maxLength: 160, 'aria-label': 'Название' },
            }}
            fullWidth
            multiline
            maxRows={4}
            disabled={disabled}
            sx={{
              ...borderless,
              '& .MuiInputBase-input': {
                fontSize: 21,
                fontWeight: 500,
                lineHeight: 1.4,
                letterSpacing: '-.3px',
              },
            }}
          />
          <TextField
            placeholder="Добавьте описание…"
            value={description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            variant="standard"
            multiline
            minRows={3}
            maxRows={10}
            fullWidth
            slotProps={{
              input: { disableUnderline: true },
              htmlInput: { maxLength: 5000, 'aria-label': 'Описание' },
            }}
            disabled={disabled}
            sx={{
              ...borderless,
              mt: 1.7,
              mb: 2.5,
              '& .MuiInputBase-input': { fontSize: 14, lineHeight: 1.65 },
            }}
          />
          <TaskProperties
            status={selectedStatus}
            priority={priority}
            labels={labels}
            onStatus={(status) => setDraft({ ...draft, status })}
            onPriority={(priority) => setDraft({ ...draft, priority })}
            onLabels={(labels) => setDraft({ ...draft, labels })}
            assigneeId={assigneeId}
            onAssignee={(assigneeId) => setDraft({ ...draft, assigneeId })}
            disabled={disabled}
          />
          {!!files.length && (
            <Box sx={{ mt: 2 }}>
              <AttachmentList files={files} onChange={setFiles} disabled={disabled} />
            </Box>
          )}
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <AttachmentButton
            files={files}
            onChange={setFiles}
            onError={setError}
            onReading={setReading}
            disabled={disabled}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={disabled}
            sx={{ ml: 'auto', fontSize: 12, minHeight: 34, px: 1.75 }}
          >
            {pending ? 'Сохраняем…' : 'Создать задачу'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
