import { useEffect, useState } from 'react';
import { Alert, Box, Button, Divider, TextField, Typography } from '@mui/material';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { useTaskDraft } from '../../model/useTaskDraft';
import { type Task, type TaskInput } from '../../model/types';
import { TaskProperties } from '../shared/TaskProperties';
import { AttachmentButton, AttachmentList } from '../shared/TaskAttachments';
import { TaskActivity } from './TaskActivity';

interface Props {
  task: Task;
  onSave: (data: TaskInput, id: string) => Promise<Task>;
  onDelete: (task: Task) => void;
  pending: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}
export function TaskPage({ task, onSave, onDelete, pending, onDirtyChange }: Props) {
  const {
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
  } = useTaskDraft(task, onSave, pending);
  const [commentDirty, setCommentDirty] = useState(false);
  useEffect(() => {
    onDirtyChange?.(dirty || reading || commentDirty);
  }, [dirty, reading, commentDirty, onDirtyChange]);
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
