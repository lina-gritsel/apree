import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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
  Typography,
  useMediaQuery,
} from '@mui/material';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { filterTasks, statuses, type Priority, type Status, type Task } from './api/tasks';
import { makeTheme } from './theme';
import { useTasks } from './hooks/useTasks';
import { BoardIntro } from './components/BoardIntro';
import { Header } from './components/Header';
import { BoardToolbar } from './components/BoardToolbar';
import { BoardColumn } from './components/BoardColumn';
import { TaskCard } from './components/TaskCard';
import { TaskDrawer } from './components/TaskDrawer';
import { DeleteDialog } from './components/DeleteDialog';

function initialTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem('sobrano-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
export function App() {
  const [mode, setMode] = useState(initialTheme);
  const theme = useMemo(() => makeTheme(mode), [mode]);
  const mobile = useMediaQuery('(max-width:767px)');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [mobileStatus, setMobileStatus] = useState<Status>('new');
  const [editor, setEditor] = useState<{ task?: Task; status: Status } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [active, setActive] = useState<Task | null>(null);
  const { query, save, remove, move } = useTasks((message, error = false) =>
    setNotice({ message, error }),
  );
  const tasks = query.data ?? [];
  const filtered = filterTasks(tasks, search, priority);
  const done = tasks.filter((task) => task.status === 'done').length;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const create = (status: Status) => setEditor({ status });
  const open = (task: Task) => {
    if (!move.isPending) setEditor({ task, status: task.status });
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
      localStorage.setItem('sobrano-theme', next);
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
      if (editor?.task?.id === deleting.id) setEditor(null);
      setDeleting(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Не удалось удалить задачу.');
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header dark={mode === 'dark'} onTheme={toggleTheme} />
      <Box
        component="main"
        sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2.5, md: 5 }, pt: { xs: 4, md: 6 } }}
      >
        <BoardIntro done={done} total={tasks.length} />
        <BoardToolbar
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
        {mobile && (
          <Tabs
            value={mobileStatus}
            onChange={(_, value: Status) => setMobileStatus(value)}
            variant="fullWidth"
            sx={{ mt: 2 }}
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
              gridTemplateColumns: mobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))',
              gap: { xs: 0, md: 2 },
              mx: -1.4,
              pt: 2.5,
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
        <Box
          component="footer"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 2.5,
            mt: 3,
            color: 'text.secondary',
          }}
        >
          <Typography sx={{ fontSize: 10 }}>Меньше шума. Больше сделанного.</Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ fontSize: 10 }}>Перетаскивайте задачи между колонками</Typography>
            <ArrowForwardRounded sx={{ fontSize: 13 }} />
          </Box>
        </Box>
      </Box>
      {editor && (
        <TaskDrawer
          key={editor.task?.id ?? 'new'}
          task={editor.task}
          status={editor.status}
          onClose={() => setEditor(null)}
          onSave={async (data, id) => {
            const saved = await save.mutateAsync({ data, id });
            setMobileStatus(saved.status);
          }}
          onDelete={askDelete}
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
