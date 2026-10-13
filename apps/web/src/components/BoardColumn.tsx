import { useDroppable } from '@dnd-kit/core';
import { Box, Button, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { statuses, type Task, type Status } from '../api/tasks';
import { TaskCard } from './TaskCard';
interface Props {
  status: (typeof statuses)[number];
  tasks: Task[];
  loading: boolean;
  filtered: boolean;
  busy: boolean;
  onCreate: (status: Status) => void;
  onOpen: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  onDelete: (task: Task) => void;
}
export function BoardColumn({
  status,
  tasks,
  loading,
  filtered,
  busy,
  onCreate,
  onOpen,
  onMove,
  onDelete,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status.value });
  return (
    <Box
      ref={setNodeRef}
      component="section"
      data-testid={'column-' + status.value}
      aria-label={status.label}
      sx={{
        p: 1.4,
        pt: 0,
        borderRadius: 3,
        minHeight: { xs: 350, md: 440 },
        bgcolor: isOver ? 'action.selected' : 'transparent',
        outline: isOver ? '2px dashed' : '2px solid transparent',
        outlineColor: isOver ? 'primary.main' : 'transparent',
        transition: 'background .15s',
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, mb: 1.2 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: status.color,
            boxShadow: '0 0 0 4px ' + status.color + '12',
          }}
        />
        <Typography sx={{ fontSize: 13, fontWeight: 650, ml: 0.4 }}>{status.label}</Typography>
        <Box
          component="span"
          sx={{
            bgcolor: 'action.hover',
            color: 'text.secondary',
            borderRadius: 1,
            px: 0.8,
            fontSize: 11,
            lineHeight: '21px',
          }}
        >
          {tasks.length}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={'Добавить в «' + status.label + '»'}>
          <IconButton
            size="small"
            aria-label={'Добавить в «' + status.label + '»'}
            onClick={() => onCreate(status.value)}
          >
            <AddRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
        {loading
          ? [1, 2].map((id) => <Skeleton key={id} variant="rounded" height={165} />)
          : tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onOpen}
                onMove={onMove}
                onDelete={onDelete}
                busy={busy}
              />
            ))}
        {!loading && !tasks.length && (
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2.5,
              textAlign: 'center',
              py: 5,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                mx: 'auto',
                mb: 1.5,
                display: 'grid',
                placeItems: 'center',
                color: status.color,
                bgcolor: status.color + '12',
                borderRadius: '50%',
              }}
            >
              {status.value === 'done' ? (
                <CheckRounded fontSize="small" />
              ) : (
                <AddRounded fontSize="small" />
              )}
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              {filtered ? 'Ничего не найдено' : 'Пока свободно'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6, fontSize: 11 }}>
              {filtered ? 'Попробуйте изменить поиск или фильтр' : status.hint}
            </Typography>
          </Box>
        )}
        {!loading && (
          <Button
            color="inherit"
            startIcon={<AddRounded sx={{ fontSize: '16px !important' }} />}
            onClick={() => onCreate(status.value)}
            sx={{
              justifyContent: 'flex-start',
              fontSize: 12,
              fontWeight: 400,
              color: 'text.secondary',
              minHeight: 38,
            }}
          >
            Добавить задачу
          </Button>
        )}
      </Box>
    </Box>
  );
}
