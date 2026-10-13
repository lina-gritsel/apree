import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Tooltip,
} from '@mui/material';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { statuses, type Task, type Status } from '../api/tasks';
import { PriorityBadge } from './PriorityBadge';
interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  onDelete: (task: Task) => void;
  busy?: boolean;
  overlay?: boolean;
}
export function TaskCard({ task, onOpen, onMove, onDelete, busy, overlay }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: overlay ? 'overlay-' + task.id : task.id,
    disabled: busy || overlay,
  });
  return (
    <Box
      ref={setNodeRef}
      data-testid={(overlay ? 'overlay-' : 'task-') + task.id}
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: overlay ? 'primary.main' : 'divider',
        borderRadius: '8px',
        opacity: isDragging ? 0.3 : 1,
        boxShadow: overlay ? '0 8px 24px #17202f20' : 'none',
        transition: 'border-color .15s',
        '&:hover': { borderColor: 'text.secondary' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, pt: 0.8 }}>
        <Typography
          sx={{
            fontSize: 11,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '.2px',
          }}
        >
          TSK-{task.id.slice(-6).toUpperCase()}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Перетащить">
          <IconButton
            size="small"
            aria-label={'Переместить: ' + task.title}
            {...attributes}
            {...listeners}
            disabled={busy}
            sx={{
              cursor: 'grab',
              touchAction: 'none',
              color: 'text.secondary',
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragIndicatorRounded sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          aria-label={'Действия: ' + task.title}
          onClick={(event) => setAnchor(event.currentTarget)}
          disabled={busy}
        >
          <MoreHorizRounded sx={{ fontSize: 19 }} />
        </IconButton>
      </Box>
      <ButtonBase
        onClick={() => onOpen(task)}
        aria-label={'Открыть задачу: ' + task.title}
        sx={{
          width: '100%',
          display: 'block',
          textAlign: 'left',
          px: 1.5,
          pt: 0.5,
          pb: 1.5,
          borderRadius: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            lineHeight: 1.5,
            fontWeight: 500,
            overflowWrap: 'anywhere',
            color: task.status === 'done' ? 'text.secondary' : 'text.primary',
          }}
        >
          {task.title}
        </Typography>
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontSize: 12,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
            }}
          >
            {task.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <PriorityBadge priority={task.priority} />
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            {new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(
              new Date(task.createdAt),
            )}
          </Typography>
        </Box>
      </ButtonBase>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {statuses.map((status) => (
          <MenuItem
            key={status.value}
            disabled={status.value === task.status}
            onClick={() => {
              setAnchor(null);
              onMove(task.id, status.value);
            }}
            sx={{ gap: 1.2, fontSize: 13 }}
          >
            <ArrowForwardRounded sx={{ fontSize: 16 }} />
            {status.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onDelete(task);
          }}
          sx={{ color: 'error.main', gap: 1.2, fontSize: 13 }}
        >
          <DeleteOutlineRounded sx={{ fontSize: 17 }} />
          Удалить задачу
        </MenuItem>
      </Menu>
    </Box>
  );
}
