import { useDroppable } from '@dnd-kit/core';
import { Box, Button, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import { StatusIcon } from '../shared/StatusIcon';
import { statuses } from '../../model/constants';
import { type Task, type Status } from '../../model/types';
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
        p: 1,
        pt: 0.5,
        borderRadius: '8px',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isOver ? 'action.selected' : 'transparent',
        outline: isOver ? '2px dashed' : '2px solid transparent',
        outlineColor: isOver ? 'primary.main' : 'transparent',
        transition: 'background .15s',
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, py: 1, mb: 0.6 }}>
        <StatusIcon status={status.value} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, ml: 0.25 }}>{status.label}</Typography>
        <Box
          component="span"
          sx={{
            color: 'text.secondary',
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehaviorY: 'contain',
          '& > *': { flexShrink: 0 },
        }}
      >
        {loading
          ? [1, 2].map((id) => <Skeleton key={id} variant="rounded" height={140} />)
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
              borderRadius: '6px',
              textAlign: 'center',
              py: 3,
              px: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              {filtered ? 'Ничего не найдено' : 'Нет задач'}
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
