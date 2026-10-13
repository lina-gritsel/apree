import { useState } from 'react';
import { Alert, Box, Button, CssBaseline, Snackbar, ThemeProvider } from '@mui/material';
import type { Status, Task } from '../features/tasks/model/types';
import { useColorMode } from './useColorMode';
import { useTaskNavigation } from './useTaskNavigation';
import { useTasks } from '../features/tasks/model/useTasks';
import { useBoardState } from '../features/tasks/model/useBoardState';
import { Header } from '../shell/Header';
import { Sidebar } from '../shell/Sidebar';
import { TaskBoard } from '../features/tasks/components/board/TaskBoard';
import { TaskPage } from '../features/tasks/components/detail/TaskPage';
import { TaskDialog } from '../features/tasks/components/create/TaskDialog';
import { DeleteDialog } from '../features/tasks/components/shared/DeleteDialog';

export function App() {
  const { taskId, navigate, onDirtyChange } = useTaskNavigation();
  const { mode, theme, toggle: toggleTheme } = useColorMode();
  const [editor, setEditor] = useState<{ status: Status } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const { query, save, remove, move } = useTasks((message, error = false) =>
    setNotice({ message, error }),
  );
  const tasks = query.data ?? [];
  const board = useBoardState(tasks);
  const selectedTask = tasks.find((task) => task.id === taskId);
  const done = tasks.filter((task) => task.status === 'done').length;
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
          <TaskBoard
            state={board}
            loading={query.isPending}
            error={query.isError}
            busy={move.isPending}
            onRetry={() => void query.refetch()}
            onCreate={create}
            onOpen={open}
            onMove={changeStatus}
            onDelete={askDelete}
          />
        )}
      </Box>
      {editor && (
        <TaskDialog
          status={editor.status}
          onClose={() => setEditor(null)}
          onSave={async (data) => {
            const saved = await save.mutateAsync({ data });
            board.setMobileStatus(saved.status);
            return saved;
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
