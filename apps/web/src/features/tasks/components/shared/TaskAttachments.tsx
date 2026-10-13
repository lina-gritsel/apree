import { useRef, useState } from 'react';
import { Box, IconButton, Link, Tooltip, Typography } from '@mui/material';
import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { readAttachment, type DraftAttachment } from '../../model/attachments';
export function AttachmentButton({
  files,
  onChange,
  onError,
  onReading,
  disabled,
}: {
  files: DraftAttachment[];
  onChange: (files: DraftAttachment[]) => void;
  onError: (message: string) => void;
  onReading: (value: boolean) => void;
  disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const readingLock = useRef(false);
  const [reading, setReading] = useState(false);
  async function select(selected: FileList | null) {
    if (!selected?.length || disabled || readingLock.current) return;
    const added = Array.from(selected);
    if (files.length + added.length > 3) {
      onError('Можно прикрепить не больше 3 файлов.');
      return;
    }
    if (added.some((file) => file.size > 2 * 1024 * 1024)) {
      onError('Размер каждого файла не должен превышать 2 МБ.');
      return;
    }
    readingLock.current = true;
    setReading(true);
    onReading(true);
    try {
      onChange([...files, ...(await Promise.all(added.map(readAttachment)))]);
      onError('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось прочитать файл.');
    } finally {
      readingLock.current = false;
      setReading(false);
      onReading(false);
    }
  }
  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        disabled={disabled || reading}
        aria-label="Файлы"
        onChange={(event) => {
          void select(event.target.files);
          event.target.value = '';
        }}
      />
      <Tooltip title="Прикрепить файлы · до 3 файлов по 2 МБ">
        <span>
          <IconButton
            aria-label="Прикрепить файлы"
            disabled={disabled || reading || files.length >= 3}
            onClick={() => input.current?.click()}
            sx={{ color: 'text.secondary' }}
          >
            <AttachFileRounded sx={{ fontSize: 19 }} />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}
export function AttachmentList({
  files,
  taskId,
  onChange,
  disabled,
}: {
  files: DraftAttachment[];
  taskId?: string;
  onChange: (files: DraftAttachment[]) => void;
  disabled: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {files.map((file, index) => (
        <Box
          key={file.id ?? file.name + index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: 12,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '6px',
            px: 1,
            py: 0.25,
          }}
        >
          <AttachFileRounded sx={{ fontSize: 15, color: 'text.secondary' }} />
          {file.id && taskId ? (
            <Link
              href={'/api/tasks/' + taskId + '/attachments/' + file.id}
              download
              sx={{ overflowWrap: 'anywhere', color: 'text.primary' }}
            >
              {file.name}
            </Link>
          ) : (
            <Typography sx={{ fontSize: 12, overflowWrap: 'anywhere' }}>{file.name}</Typography>
          )}
          <Typography
            sx={{ ml: 'auto', whiteSpace: 'nowrap', fontSize: 11, color: 'text.secondary' }}
          >
            {Math.max(1, Math.round(file.size / 1024))} КБ
          </Typography>
          <IconButton
            size="small"
            aria-label={'Убрать файл: ' + file.name}
            disabled={disabled}
            onClick={() => onChange(files.filter((_, i) => i !== index))}
          >
            <CloseRounded sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
