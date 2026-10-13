import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { Task } from '../../model/types';
export function DeleteDialog({
  task,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  task: Task;
  pending: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open
      onClose={pending ? undefined : onClose}
      aria-labelledby="delete-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="delete-title">Удалить задачу?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ overflowWrap: 'anywhere', fontSize: 14 }}>
          «{task.title}» будет удалена. Это действие нельзя отменить.
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={pending}>
          Отмена
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={pending}>
          {pending ? 'Удаляем…' : 'Удалить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
