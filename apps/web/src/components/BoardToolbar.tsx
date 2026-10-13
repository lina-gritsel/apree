import { Box, Button, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import ViewKanbanOutlined from '@mui/icons-material/ViewKanbanOutlined';
import { priorities, type Priority } from '../api/tasks';
export function BoardToolbar({
  search,
  priority,
  onSearch,
  onPriority,
  onCreate,
}: {
  search: string;
  priority: Priority | 'all';
  onSearch: (value: string) => void;
  onPriority: (value: Priority | 'all') => void;
  onCreate: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.3,
        py: 2.5,
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1, mr: 'auto' }}>
        <ViewKanbanOutlined sx={{ fontSize: 19, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Доска</Typography>
      </Box>
      <TextField
        size="small"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Поиск задач…"
        slotProps={{
          htmlInput: { 'aria-label': 'Поиск задач' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 19, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: '100%', sm: 240 } }}
      />
      <TextField
        select
        size="small"
        value={priority}
        onChange={(event) => onPriority(event.target.value as Priority | 'all')}
        slotProps={{ select: { inputProps: { 'aria-label': 'Фильтр приоритета' } } }}
        sx={{ minWidth: 164, flex: { xs: 1, sm: 'initial' } }}
      >
        <MenuItem value="all">Все приоритеты</MenuItem>
        {Object.entries(priorities).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" startIcon={<AddRounded />} onClick={onCreate}>
        Создать задачу
      </Button>
    </Box>
  );
}
