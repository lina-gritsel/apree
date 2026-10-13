import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import ChangeCircleOutlined from '@mui/icons-material/ChangeCircleOutlined';
import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import { tasksApi } from '../../api/tasksApi';
import { type ActivityEvent } from '../../model/types';
import { TaskCommentComposer } from './TaskCommentComposer';
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
  useEffect(() => {
    void client.invalidateQueries({ queryKey: ['task-activity', taskId] });
  }, [client, taskId, updatedAt]);
  const sent = (event: ActivityEvent) => {
    client.setQueryData<ActivityEvent[]>(queryKey, (events) => [
      ...(events ?? []).filter((item) => item.id !== event.id),
      event,
    ]);
    void client.invalidateQueries({ queryKey });
  };
  return (
    <Box component="section" aria-label="Активность" sx={{ mt: 4.5, pt: 2 }}>
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
        {activity.map((event) => (
          <Box key={event.id} sx={{ display: 'flex', gap: 1.3, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 19,
                height: 20,
                mt: 0.1,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: 'text.secondary',
              }}
            >
              {event.kind === 'comment' ? (
                <ChatBubbleOutlineRounded sx={{ fontSize: 15 }} />
              ) : event.kind === 'created' ? (
                <RadioButtonUncheckedRounded sx={{ fontSize: 13 }} />
              ) : (
                <ChangeCircleOutlined sx={{ fontSize: 15 }} />
              )}
            </Box>
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
                ...(event.kind === 'comment' && {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  px: 1.7,
                  py: 1.3,
                }),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.1, flexWrap: 'wrap' }}>
                {event.kind === 'comment' ? (
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>Комментарий</Typography>
                ) : (
                  <Typography
                    sx={{
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: 'text.secondary',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {event.message}
                  </Typography>
                )}
                <Typography
                  component="time"
                  dateTime={event.createdAt}
                  sx={{ fontSize: 10, color: 'text.secondary', whiteSpace: 'nowrap' }}
                >
                  {new Intl.DateTimeFormat('ru', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(event.createdAt))}
                </Typography>
              </Box>
              {event.kind === 'comment' && (
                <Typography
                  sx={{
                    mt: 0.8,
                    fontSize: 13,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {event.message}
                </Typography>
              )}
              {event.attachments?.map((file) => (
                <Link
                  key={file.id}
                  href={'/api/tasks/' + taskId + '/attachments/' + file.id}
                  download
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    mt: 1,
                    fontSize: 12,
                    overflowWrap: 'anywhere',
                    color: 'text.primary',
                  }}
                >
                  <AttachFileRounded sx={{ fontSize: 14 }} />
                  {file.name}
                </Link>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <TaskCommentComposer taskId={taskId} onSent={sent} onDirtyChange={onDirtyChange} />
    </Box>
  );
}
