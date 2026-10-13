import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, IconButton, TextField, Tooltip } from '@mui/material';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import { tasksApi, type ActivityEvent } from '../api/tasks';
import {
  AttachmentButton,
  AttachmentList,
  attachmentPayload,
  type DraftAttachment,
} from './TaskAttachments';
export function TaskCommentComposer({
  taskId,
  onSent,
  onDirtyChange,
}: {
  taskId: string;
  onSent: (event: ActivityEvent) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<DraftAttachment[]>([]);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState('');
  const submitting = useRef(false);
  const comment = useMutation({
    mutationFn: () => tasksApi.comment(taskId, body.trim(), attachmentPayload(files)),
    onSuccess: (event) => {
      onSent(event);
      setBody('');
      setFiles([]);
    },
  });
  useEffect(() => {
    onDirtyChange?.(!!body.trim() || !!files.length);
  }, [body, files, onDirtyChange]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() || reading || submitting.current) return;
    submitting.current = true;
    try {
      await comment.mutateAsync();
    } catch {
      /* Keep text and files visible for retry. */
    } finally {
      submitting.current = false;
    }
  }
  const disabled = reading || comment.isPending;
  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        mt: 3,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1b1b1b' : '#f5f5f6'),
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '9px',
        px: 1.8,
        pt: 1.5,
        pb: 1,
      }}
    >
      {(comment.isError || fileError) && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {fileError || comment.error?.message}
        </Alert>
      )}
      <TextField
        variant="standard"
        placeholder="Оставить комментарий…"
        multiline
        minRows={2}
        maxRows={10}
        fullWidth
        value={body}
        disabled={disabled}
        onChange={(event) => setBody(event.target.value)}
        slotProps={{
          input: { disableUnderline: true },
          htmlInput: { 'aria-label': 'Комментарий', maxLength: 5000 },
        }}
        sx={{ '& .MuiInputBase-root': { fontSize: 13, bgcolor: 'transparent' } }}
      />
      {!!files.length && (
        <Box sx={{ mt: 1.5 }}>
          <AttachmentList files={files} onChange={setFiles} disabled={disabled} />
        </Box>
      )}
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 1.2 }}
      >
        <AttachmentButton
          files={files}
          onChange={setFiles}
          onReading={setReading}
          onError={setFileError}
          disabled={disabled}
        />
        <Tooltip title="Отправить комментарий">
          <span>
            <IconButton
              type="submit"
              aria-label="Отправить комментарий"
              disabled={!body.trim() || disabled}
              size="small"
              sx={{
                width: 27,
                height: 27,
                borderRadius: '50%',
                bgcolor: 'action.selected',
                color: 'text.primary',
                '&.Mui-disabled': { bgcolor: 'action.selected', color: 'text.disabled' },
              }}
            >
              <ArrowUpwardRounded sx={{ fontSize: 17 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
