import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, ButtonBase, IconButton, Menu, MenuItem, Divider, Typography } from '@mui/material';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import { UserAvatar } from './UserAvatar';
import { StatusIcon } from './StatusIcon';
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
        borderColor: overlay ? 'primary.main' : 'transparent',
        borderRadius: '8px',
        opacity: isDragging ? 0.3 : 1,
        boxShadow: overlay ? '0 12px 30px #0006' : 'none',
        transition: 'border-color .15s',
        '&:hover': { borderColor: 'divider' },
      }}
    >
      <ButtonBase
        {...attributes}
        {...listeners}
        onClick={() => {
          if (!isDragging && !overlay) onOpen(task);
        }}
        aria-label={'Открыть задачу: ' + task.title}
        sx={{
          width: '100%',
          display: 'block',
          textAlign: 'left',
          px: 1.5,
          pt: 1.3,
          cursor: isDragging || overlay ? 'grabbing' : 'pointer',
          touchAction: 'pan-y',
          pb: 1.5,
          borderRadius: '6px',
        }}
      >
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.9, pr: 6 }}>
          TSK-{task.id.slice(-6).toUpperCase()}
        </Typography>
        <Box sx={{ position: 'absolute', right: 14, top: 10 }}>
          <UserAvatar user={task.assignee ?? null} size={22} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
          <Box sx={{ display: 'flex', pt: 0.3 }}>
            <StatusIcon status={task.status} />
          </Box>
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
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.6,
            mt: 1.5,
            '& > span': {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.9,
              py: 0.3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '14px',
              fontSize: 11,
              color: 'text.secondary',
            },
          }}
        >
          <Box component="span">
            <PriorityBadge priority={task.priority} />
          </Box>
          {task.labels?.map((label) => (
            <Box component="span" key={label}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
              {label}
            </Box>
          ))}
          {!!task.attachments?.length && (
            <Box component="span">
              <AttachFileRounded sx={{ fontSize: 13 }} />
              {task.attachments.length}
            </Box>
          )}
        </Box>
        <Typography sx={{ mt: 1.2, fontSize: 11, color: 'text.secondary' }}>
          Создана{' '}
          {new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(
            new Date(task.createdAt),
          )}
        </Typography>
      </ButtonBase>
      <IconButton
        size="small"
        aria-label={'Действия: ' + task.title}
        onClick={(event) => setAnchor(event.currentTarget)}
        disabled={busy}
        sx={{
          position: 'absolute',
          right: 42,
          top: 7,
          opacity: 0,
          '@media (hover: none)': { opacity: 1 },
          '.MuiBox-root:hover > &': { opacity: 1 },
          '&:focus-visible': { opacity: 1 },
          color: 'text.secondary',
        }}
      >
        <MoreHorizRounded sx={{ fontSize: 17 }} />
      </IconButton>
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
