import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  Snackbar,
  Tab,
  Tabs,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import { filterTasks, statuses, type Priority, type Status, type Task } from './api/tasks';
import { makeTheme } from './theme';
import { TaskPage } from './components/TaskPage';
import { useTaskNavigation } from './hooks/useTaskNavigation';
import { useTasks } from './hooks/useTasks';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BoardToolbar } from './components/BoardToolbar';
import { TaskList } from './components/TaskList';
import { BoardColumn } from './components/BoardColumn';
import { TaskCard } from './components/TaskCard';
import { TaskDialog } from './components/TaskDialog';
import { DeleteDialog } from './components/DeleteDialog';

function initialTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem('forma-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}
export function App() {
  const { taskId, navigate, onDirtyChange } = useTaskNavigation();
  const [mode, setMode] = useState(initialTheme);
  const theme = useMemo(() => makeTheme(mode), [mode]);
  const mobile = useMediaQuery('(max-width:767px)');
  const [view, setView] = useState<'board' | 'list'>(() => {
    try {
      return localStorage.getItem('apri-view') === 'list' ? 'list' : 'board';
    } catch {
      return 'board';
    }
  });
  const changeView = (value: 'board' | 'list') => {
    setView(value);
    try {
      localStorage.setItem('apri-view', value);
    } catch {
      /* View remains usable without storage. */
    }
  };
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [mobileStatus, setMobileStatus] = useState<Status>('new');
  const [editor, setEditor] = useState<{ status: Status } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [active, setActive] = useState<Task | null>(null);
  const { query, save, remove, move } = useTasks((message, error = false) =>
    setNotice({ message, error }),
  );
  const tasks = query.data ?? [];
  const filtered = filterTasks(tasks, search, priority);
  const selectedTask = tasks.find((task) => task.id === taskId);
  const done = tasks.filter((task) => task.status === 'done').length;
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const create = (status: Status) => setEditor({ status });
  const open = (task: Task) => {
    if (!move.isPending) navigate(task.id);
  };
  const changeStatus = (id: string, status: Status) => {
    if (!move.isPending) move.mutate({ id, status });
  };
  const askDelete = (task: Task) => {
    setDeleteError('');
    setDeleting(task);
  };
  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    try {
      localStorage.setItem('forma-theme', next);
    } catch {
      /* Theme still works when browser storage is unavailable. */
    }
  };
  function dragEnd({ active: dragged, over }: DragEndEvent) {
    setActive(null);
    const task = tasks.find((item) => item.id === dragged.id);
    const status = statuses.find((item) => item.value === over?.id)?.value;
    if (task && status && task.status !== status) changeStatus(task.id, status);
  }
  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      if (taskId === deleting.id) navigate(null, true);
      setDeleting(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Не удалось удалить задачу.');
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {active && <Box component="style">{'body, body * { cursor: grabbing !important; }'}</Box>}
      <Sidebar onCreate={() => create('new')} onBoard={() => navigate(null)} />
      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: '220px' },
          m: { xs: 0, md: '8px 8px 8px 220px' },
          height: { xs: '100dvh', md: 'calc(100dvh - 16px)' },
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 0, md: '10px' },
          bgcolor: mode === 'dark' ? '#111111' : '#fafafa',
          overflow: 'hidden',
        }}
      >
        <Header
          dark={mode === 'dark'}
          onTheme={toggleTheme}
          count={tasks.length}
          done={done}
          taskId={taskId}
          onBack={() => navigate(null)}
        />
        {taskId ? (
          selectedTask ? (
            <TaskPage
              key={taskId}
              task={selectedTask}
              onSave={(data, id) => save.mutateAsync({ data, id })}
              pending={save.isPending}
              onDelete={askDelete}
              onDirtyChange={onDirtyChange}
            />
          ) : (
            <Box sx={{ p: 4 }}>
              <Alert severity={query.isError ? 'error' : 'info'}>
                {query.isPending
                  ? 'Загрузка задачи…'
                  : query.isError
                    ? 'Не удалось загрузить задачу'
                    : 'Задача не найдена или удалена'}
              </Alert>
              <Button onClick={() => (query.isError ? void query.refetch() : navigate(null))}>
                {query.isError ? 'Повторить' : 'К задачам'}
              </Button>
            </Box>
          )
        ) : (
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
              view={view}
              onView={changeView}
              search={search}
              priority={priority}
              onSearch={setSearch}
              onPriority={setPriority}
              onCreate={() => create('new')}
            />
            {query.isError && (
              <Alert
                severity="error"
                sx={{ mt: 3 }}
                action={
                  <Button color="inherit" onClick={() => void query.refetch()}>
                    Повторить
                  </Button>
                }
              >
                Не удалось загрузить задачи. Проверьте подключение и попробуйте ещё раз.
              </Alert>
            )}
            {mobile && view === 'board' && (
              <Tabs
                value={mobileStatus}
                onChange={(_, value: Status) => setMobileStatus(value)}
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
                      filtered.filter((task) => task.status === status.value).length
                    }
                    sx={{ minWidth: 0, px: 0, fontSize: 12, textTransform: 'none' }}
                  />
                ))}
              </Tabs>
            )}
            {view === 'list' ? (
              <TaskList
                tasks={filtered}
                loading={query.isPending}
                filtered={!!search.trim() || priority !== 'all'}
                onOpen={open}
                onCreate={create}
              />
            ) : (
              <DndContext
                sensors={sensors}
                onDragStart={(event) =>
                  setActive(tasks.find((task) => task.id === event.active.id) ?? null)
                }
                onDragEnd={dragEnd}
                onDragCancel={() => setActive(null)}
                accessibility={{
                  screenReaderInstructions: {
                    draggable:
                      'Чтобы взять задачу, нажмите пробел. Перемещайте её стрелками. Нажмите пробел для завершения или Escape для отмены. Статус также можно изменить через меню задачи.',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    flex: 1,
                    minHeight: 0,
                    gridTemplateRows: 'minmax(0, 1fr)',
                    gridTemplateColumns: mobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))',
                    gap: 1.5,
                    pt: 0.5,
                    pb: 1,
                  }}
                >
                  {statuses
                    .filter((status) => !mobile || status.value === mobileStatus)
                    .map((status) => (
                      <BoardColumn
                        key={status.value}
                        status={status}
                        tasks={filtered.filter((task) => task.status === status.value)}
                        loading={query.isPending}
                        filtered={!!search.trim() || priority !== 'all'}
                        busy={move.isPending}
                        onCreate={create}
                        onOpen={open}
                        onMove={changeStatus}
                        onDelete={askDelete}
                      />
                    ))}
                </Box>
                <DragOverlay dropAnimation={null}>
                  {active && (
                    <TaskCard
                      task={active}
                      onOpen={open}
                      onMove={changeStatus}
                      onDelete={askDelete}
                      overlay
                    />
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </Box>
        )}
      </Box>
      {editor && (
        <TaskDialog
          status={editor.status}
          onClose={() => setEditor(null)}
          onSave={async (data, id) => {
            const saved = await save.mutateAsync({ data, id });
            setMobileStatus(saved.status);
          }}
          pending={save.isPending}
        />
      )}
      {deleting && (
        <DeleteDialog
          task={deleting}
          pending={remove.isPending}
          error={deleteError}
          onClose={() => setDeleting(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
      <Snackbar
        open={!!notice}
        autoHideDuration={5000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotice(null)}
          severity={notice?.error ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
