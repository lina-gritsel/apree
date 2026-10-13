import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import FormatListBulletedRounded from '@mui/icons-material/FormatListBulletedRounded';
import ViewKanbanOutlined from '@mui/icons-material/ViewKanbanOutlined';
import { priorities } from '../../model/constants';
import { type Priority } from '../../model/types';

interface Props {
  view: 'board' | 'list';
  onView: (view: 'board' | 'list') => void;
  search: string;
  priority: Priority | 'all';
  onSearch: (value: string) => void;
  onPriority: (value: Priority | 'all') => void;
  onCreate: () => void;
}

export function BoardToolbar({
  view,
  onView,
  search,
  priority,
  onSearch,
  onPriority,
  onCreate,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1.4,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={view}
        onChange={(_, value: 'board' | 'list' | null) => {
          if (value) onView(value);
        }}
        aria-label="Вид задач"
        size="small"
        sx={{
          mr: 'auto',
          flexShrink: 0,
          '& .MuiToggleButton-root': {
            px: 1.2,
            height: 34,
            gap: 0.7,
            fontSize: 12,
            textTransform: 'none',
            borderColor: 'divider',
            color: 'text.secondary',
            '&.Mui-selected': { bgcolor: 'action.selected', color: 'text.primary' },
            '&.Mui-selected:hover': { bgcolor: 'action.selected' },
          },
        }}
      >
        <ToggleButton value="list" aria-label="Список">
          <FormatListBulletedRounded sx={{ fontSize: 16 }} />
          Список
        </ToggleButton>
        <ToggleButton value="board" aria-label="Доска">
          <ViewKanbanOutlined sx={{ fontSize: 16 }} />
          Доска
        </ToggleButton>
      </ToggleButtonGroup>
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
