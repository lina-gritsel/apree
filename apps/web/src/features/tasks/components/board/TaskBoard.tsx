import { Alert, Box, Button, Tab, Tabs, useMediaQuery } from '@mui/material';
import { statuses } from '../../model/constants';
import type { Task, Status } from '../../model/types';
import type { useBoardState } from '../../model/useBoardState';
import { BoardToolbar } from './BoardToolbar';
import { TaskList } from './TaskList';
import { KanbanBoard } from './KanbanBoard';
interface Props {
  state: ReturnType<typeof useBoardState>;
  loading: boolean;
  error: boolean;
  busy: boolean;
  onRetry: () => void;
  onCreate: (status: Status) => void;
  onOpen: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  onDelete: (task: Task) => void;
}
export function TaskBoard({
  state,
  loading,
  error,
  busy,
  onRetry,
  onCreate,
  onOpen,
  onMove,
  onDelete,
}: Props) {
  const mobile = useMediaQuery('(max-width:767px)');
  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <BoardToolbar
        view={state.view}
        onView={state.changeView}
        search={state.search}
        priority={state.priority}
        onSearch={state.setSearch}
        onPriority={state.setPriority}
        onCreate={() => onCreate('new')}
      />
      {error && (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          action={
            <Button color="inherit" onClick={onRetry}>
              Повторить
            </Button>
          }
        >
          Не удалось загрузить задачи. Проверьте подключение и попробуйте ещё раз.
        </Alert>
      )}
      {mobile && state.view === 'board' && (
        <Tabs
          value={state.mobileStatus}
          onChange={(_, value: Status) => state.setMobileStatus(value)}
          variant="fullWidth"
          sx={{ mt: 2, flexShrink: 0 }}
        >
          {statuses.map((status) => (
            <Tab
              key={status.value}
              value={status.value}
              label={
                status.label +
                ' · ' +
                state.filteredTasks.filter((task) => task.status === status.value).length
              }
              sx={{ minWidth: 0, px: 0, fontSize: 12, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      )}
      {state.view === 'list' ? (
        <TaskList
          tasks={state.filteredTasks}
          loading={loading}
          filtered={state.filtered}
          onOpen={onOpen}
          onCreate={onCreate}
        />
      ) : (
        <KanbanBoard
          tasks={state.filteredTasks}
          mobile={mobile}
          mobileStatus={state.mobileStatus}
          loading={loading}
          filtered={state.filtered}
          busy={busy}
          onCreate={onCreate}
          onOpen={onOpen}
          onMove={onMove}
          onDelete={onDelete}
        />
      )}
    </Box>
  );
}
