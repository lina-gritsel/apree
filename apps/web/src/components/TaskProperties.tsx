import { useState } from 'react';
import { Box, Button, Chip, MenuItem, Popover, TextField } from '@mui/material';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import { priorities, statuses, type Priority, type Status } from '../api/tasks';
import { StatusIcon } from './StatusIcon';
import { PriorityBadge } from './PriorityBadge';
interface Props {
  status: Status;
  priority: Priority;
  labels: string[];
  disabled: boolean;
  onStatus: (value: Status) => void;
  onPriority: (value: Priority) => void;
  onLabels: (value: string[]) => void;
}
const selectStyle = {
  '& .MuiOutlinedInput-root': {
    height: 32,
    borderRadius: '16px',
    fontSize: 12,
    bgcolor: 'action.selected',
  },
  '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 0.8, py: 0.5, pl: 1.2 },
};
export function TaskProperties({
  status,
  priority,
  labels,
  disabled,
  onStatus,
  onPriority,
  onLabels,
}: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [label, setLabel] = useState('');
  const add = () => {
    const value = label.trim();
    if (value && !labels.includes(value) && labels.length < 5) onLabels([...labels, value]);
    setLabel('');
    setAnchor(null);
  };
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        select
        value={status}
        disabled={disabled}
        onChange={(event) => onStatus(event.target.value as Status)}
        slotProps={{ select: { inputProps: { 'aria-label': 'Статус' } } }}
        sx={selectStyle}
      >
        {statuses.map((item) => (
          <MenuItem key={item.value} value={item.value} sx={{ gap: 1, fontSize: 12 }}>
            <StatusIcon status={item.value} />
            {item.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        value={priority}
        disabled={disabled}
        onChange={(event) => onPriority(event.target.value as Priority)}
        slotProps={{ select: { inputProps: { 'aria-label': 'Приоритет' } } }}
        sx={selectStyle}
      >
        {Object.keys(priorities).map((value) => (
          <MenuItem key={value} value={value}>
            <PriorityBadge priority={value as Priority} />
          </MenuItem>
        ))}
      </TextField>
      <Button
        color="inherit"
        variant="outlined"
        startIcon={<LabelOutlined sx={{ fontSize: '15px !important' }} />}
        disabled={disabled || labels.length >= 5}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          minHeight: 32,
          height: 32,
          borderRadius: '16px',
          fontSize: 12,
          px: 1.2,
          color: 'text.secondary',
          borderColor: 'divider',
          bgcolor: 'action.selected',
        }}
      >
        Метки
      </Button>
      {labels.map((value) => (
        <Chip
          key={value}
          label={value}
          size="small"
          disabled={disabled}
          onDelete={() => onLabels(labels.filter((item) => item !== value))}
          sx={{ borderRadius: '6px', fontSize: 12 }}
        />
      ))}
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1.5, mt: 1, width: 260 } } }}
      >
        <TextField
          autoFocus
          label="Новая метка"
          placeholder="Например, дизайн"
          value={label}
          size="small"
          fullWidth
          onChange={(event) => setLabel(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 30 } }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button onClick={add} disabled={!label.trim()} fullWidth sx={{ mt: 1 }}>
          Добавить метку
        </Button>
      </Popover>
    </Box>
  );
}
