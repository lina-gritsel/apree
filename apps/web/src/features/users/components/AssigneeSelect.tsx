import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  ListItemButton,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import { useUsers } from '../model/useUsers';
import { type User } from '../model/types';
import { UserAvatar } from './UserAvatar';
export function AssigneeSelect({
  value,
  onChange,
  disabled,
  user,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  user?: User | null;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const { query: users, create } = useUsers((created) => {
    onChange(created.id);
    setSearch('');
    setAnchor(null);
  });
  const searchTerm = search.trim().toLocaleLowerCase();
  const selected =
    users.data?.find((item) => item.id === value) ?? (user?.id === value ? user : null);
  const matches =
    users.data?.filter((item) => item.name.toLocaleLowerCase().includes(searchTerm)) ?? [];
  const canCreate =
    !!search.trim() && !users.data?.some((item) => item.name.toLocaleLowerCase() === searchTerm);
  return (
    <>
      <Button
        aria-label="Исполнитель"
        color="inherit"
        variant="outlined"
        disabled={disabled}
        onClick={(event) => setAnchor(event.currentTarget)}
        startIcon={<UserAvatar user={selected} size={18} />}
        sx={{
          minHeight: 32,
          justifyContent: 'flex-start',
          borderRadius: '16px',
          fontSize: 12,
          px: 1.1,
          color: 'text.secondary',
          borderColor: 'divider',
          bgcolor: 'action.selected',
          maxWidth: '100%',
        }}
      >
        <Box
          component="span"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {selected?.name ?? 'Без исполнителя'}
        </Box>
      </Button>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 280, maxWidth: 'calc(100vw - 32px)', p: 1, mt: 1 } } }}
      >
        <TextField
          autoFocus
          placeholder="Найти или добавить участника"
          size="small"
          fullWidth
          value={search}
          disabled={create.isPending}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Поиск исполнителя', maxLength: 80 } }}
        />
        {users.isError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Не удалось загрузить участников.
            <Button size="small" onClick={() => void users.refetch()}>
              Повторить
            </Button>
          </Alert>
        )}
        {create.isError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {create.error.message}
          </Alert>
        )}
        <Box sx={{ maxHeight: 250, overflowY: 'auto', mt: 1 }}>
          <ListItemButton
            onClick={() => {
              onChange(null);
              setAnchor(null);
            }}
            sx={{ gap: 1, borderRadius: '6px' }}
          >
            <UserAvatar size={20} />
            <Typography sx={{ fontSize: 12 }}>Без исполнителя</Typography>
          </ListItemButton>
          {matches.map((item) => (
            <ListItemButton
              key={item.id}
              selected={item.id === value}
              onClick={() => {
                onChange(item.id);
                setAnchor(null);
              }}
              sx={{ gap: 1, borderRadius: '6px' }}
            >
              <UserAvatar user={item} size={20} />
              <Typography sx={{ fontSize: 12, overflowWrap: 'anywhere' }}>{item.name}</Typography>
            </ListItemButton>
          ))}
        </Box>
        {canCreate && (
          <>
            <Divider sx={{ my: 1 }} />
            <Button
              fullWidth
              startIcon={<AddRounded />}
              onClick={() => create.mutate(search.trim())}
              disabled={create.isPending}
              sx={{ fontSize: 12, justifyContent: 'flex-start' }}
            >
              Добавить участника
            </Button>
          </>
        )}
      </Popover>
    </>
  );
}
