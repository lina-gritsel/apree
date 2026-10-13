import { Box, Button, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import ViewKanbanOutlined from '@mui/icons-material/ViewKanbanOutlined';
import { priorities, type Priority } from '../api/tasks';

interface Props {
  search: string;
  priority: Priority | 'all';
  onSearch: (value: string) => void;
  onPriority: (value: Priority | 'all') => void;
  onCreate: () => void;
}

export function BoardToolbar({ search, priority, onSearch, onPriority, onCreate }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, flexWrap: 'wrap' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 0.8,
          mr: 'auto',
          px: 1.25,
          height: 34,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '6px',
          bgcolor: 'background.paper',
        }}
      >
        <ViewKanbanOutlined sx={{ fontSize: 17, color: 'text.secondary' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>Канбан</Typography>
      </Box>
      <TextField
        size="small"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Поиск задач"
        slotProps={{
          htmlInput: { 'aria-label': 'Поиск задач' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: '100%', sm: 220 } }}
      />
      <TextField
        select
        size="small"
        value={priority}
        onChange={(event) => onPriority(event.target.value as Priority | 'all')}
        slotProps={{ select: { inputProps: { 'aria-label': 'Фильтр приоритета' } } }}
        sx={{ minWidth: 160, flex: { xs: 1, sm: 'initial' } }}
      >
        <MenuItem value="all">Все приоритеты</MenuItem>
        {Object.entries(priorities).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        startIcon={<AddRounded sx={{ fontSize: '18px !important' }} />}
        onClick={onCreate}
      >
        Создать задачу
      </Button>
    </Box>
  );
}
