import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { tasksApi, type ActivityEvent } from '../api/tasks';

export function TaskActivity({
  taskId,
  updatedAt,
  createdAt,
  onDirtyChange,
}: {
  taskId: string;
  updatedAt: string;
  createdAt: string;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const client = useQueryClient();
  const [body, setBody] = useState('');
  const submitting = useRef(false);
  const queryKey = ['task-activity', taskId];
  const query = useQuery({ queryKey, queryFn: ({ signal }) => tasksApi.activity(taskId, signal) });
  const events: ActivityEvent[] = query.data ?? [];
  const activity =
    query.isSuccess && !events.some((event) => event.kind === 'created')
      ? [
          {
            id: 'created-' + taskId,
            taskId,
            kind: 'created' as const,
            message: 'Задача создана',
            createdAt,
          },
          ...events,
        ]
      : events;
  const comment = useMutation({
    mutationFn: (message: string) => tasksApi.comment(taskId, message),
    onSuccess: (event) => {
      client.setQueryData<ActivityEvent[]>(queryKey, (events) => [
        ...(events ?? []).filter((item) => item.id !== event.id),
        event,
      ]);
      setBody('');
      void client.invalidateQueries({ queryKey });
    },
  });
  useEffect(() => {
    void client.invalidateQueries({ queryKey: ['task-activity', taskId] });
  }, [client, taskId, updatedAt]);
  useEffect(() => {
    onDirtyChange?.(!!body.trim());
  }, [body, onDirtyChange]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() || submitting.current) return;
    submitting.current = true;
    try {
      await comment.mutateAsync(body.trim());
    } catch {
      /* Mutation state displays error and keeps the draft. */
    } finally {
      submitting.current = false;
    }
  }
  return (
    <Box
      component="section"
      aria-label="Активность"
      sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Typography component="h2" sx={{ fontSize: 14, fontWeight: 600, mb: 2.5 }}>
        Активность
      </Typography>
      {query.isPending && <CircularProgress size={18} aria-label="Загрузка активности" />}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button onClick={() => void query.refetch()} color="inherit">
              Повторить
            </Button>
          }
        >
          Не удалось загрузить активность.
        </Alert>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
        {activity.map((event) => (
          <Box key={event.id} sx={{ display: 'flex', gap: 1.4, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                mt: 0.15,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              {event.kind === 'comment' ? (
                <ChatBubbleOutlineRounded sx={{ fontSize: 13 }} />
              ) : (
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary' }} />
              )}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>
                {new Intl.DateTimeFormat('ru', { dateStyle: 'medium', timeStyle: 'short' }).format(
                  new Date(event.createdAt),
                )}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: event.kind === 'comment' ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {event.message}
              </Typography>
            </Box>
          </Box>
        ))}
        {query.isSuccess && !activity.length && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Изменения и комментарии появятся здесь.
          </Typography>
        )}
      </Box>
      <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
        {comment.isError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {comment.error.message}
          </Alert>
        )}
        <TextField
          placeholder="Оставить комментарий…"
          aria-label="Комментарий"
          multiline
          minRows={2}
          maxRows={10}
          fullWidth
          value={body}
          disabled={comment.isPending}
          onChange={(event) => setBody(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Комментарий', maxLength: 5000 } }}
          sx={{ '& .MuiInputBase-root': { fontSize: 13, bgcolor: 'transparent' } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.2 }}>
          <Button
            type="submit"
            size="small"
            variant="outlined"
            disabled={!body.trim() || comment.isPending}
          >
            Отправить комментарий
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
