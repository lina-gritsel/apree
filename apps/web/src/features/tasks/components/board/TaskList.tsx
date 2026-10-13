import { useState } from 'react';
import { Box, ButtonBase, Chip, IconButton, Skeleton, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { statuses } from '../../model/constants';
import { type Status, type Task } from '../../model/types';
import { StatusIcon } from '../shared/StatusIcon';
import { PriorityBadge } from '../shared/PriorityBadge';
import { UserAvatar } from '../../../users/components/UserAvatar';

interface Props {
  tasks: Task[];
  loading: boolean;
  filtered: boolean;
  onOpen: (task: Task) => void;
  onCreate: (status: Status) => void;
}

export function TaskList({ tasks, loading, filtered, onOpen, onCreate }: Props) {
  const [collapsed, setCollapsed] = useState<Status[]>([]);
  return (
    <Box data-testid="task-list" sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 3 }}>
      {statuses.map((status) => {
        const items = tasks.filter((task) => task.status === status.value);
        const closed = collapsed.includes(status.value);
        return (
          <Box component="section" key={status.value} aria-label={status.label} sx={{ mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 42,
                bgcolor: 'background.paper',
                borderRadius: '6px',
                px: 1,
              }}
            >
              <ButtonBase
                onClick={() =>
                  setCollapsed((current) =>
                    closed
                      ? current.filter((value) => value !== status.value)
                      : [...current, status.value],
                  )
                }
                aria-expanded={!closed}
                aria-controls={`list-${status.value}`}
                aria-label={`${closed ? 'Развернуть' : 'Свернуть'}: ${status.label}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                  pr: 2,
                  borderRadius: 1,
                }}
              >
                <KeyboardArrowDownRounded
                  sx={{
                    fontSize: 16,
                    color: 'text.secondary',
                    transform: closed ? 'rotate(-90deg)' : 'none',
                  }}
                />
                <StatusIcon status={status.value} />
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{status.label}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {items.length}
                </Typography>
              </ButtonBase>
              <IconButton
                size="small"
                aria-label={`Добавить в «${status.label}»`}
                onClick={() => onCreate(status.value)}
                sx={{ ml: 'auto' }}
              >
                <AddRounded sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
            {!closed && (
              <Box id={`list-${status.value}`}>
                {loading
                  ? [1, 2].map((id) => (
                      <Skeleton key={id} variant="rectangular" height={44} sx={{ my: 0.5 }} />
                    ))
                  : items.map((task) => (
                      <ButtonBase
                        key={task.id}
                        onClick={() => onOpen(task)}
                        aria-label={`Открыть задачу: ${task.title}`}
                        data-testid={`list-task-${task.id}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: { xs: 1, md: 1.5 },
                          width: '100%',
                          textAlign: 'left',
                          minHeight: 48,
                          px: 1.5,
                          py: 0.9,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:focus-visible': { outlineOffset: -2 },
                        }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
                          <StatusIcon status={task.status} />
                        </Box>
                        <Typography
                          sx={{
                            color: 'text.secondary',
                            fontSize: 10,
                            flexShrink: 0,
                            width: { xs: 60, sm: 76 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          TSK-{task.id.slice(-6).toUpperCase()}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 13,
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Box
                          sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: 0.5,
                            maxWidth: '22%',
                            overflow: 'hidden',
                          }}
                        >
                          {task.labels?.map((label) => (
                            <Chip
                              key={label}
                              label={label}
                              size="small"
                              sx={{ height: 21, fontSize: 10 }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
                          <PriorityBadge priority={task.priority} />
                        </Box>
                        <UserAvatar user={task.assignee} size={24} />
                        <Typography
                          sx={{
                            display: { xs: 'none', lg: 'block' },
                            color: 'text.secondary',
                            fontSize: 11,
                            width: 52,
                            flexShrink: 0,
                            textAlign: 'right',
                          }}
                        >
                          {new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(
                            new Date(task.createdAt),
                          )}
                        </Typography>
                      </ButtonBase>
                    ))}
                {!loading && !items.length && (
                  <Typography sx={{ px: 4.5, py: 2, fontSize: 12, color: 'text.secondary' }}>
                    {filtered ? 'Ничего не найдено' : 'Нет задач'}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
