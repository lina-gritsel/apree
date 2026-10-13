import { Box, useTheme } from '@mui/material';
import { priorities, type Priority } from '../api/tasks';
export function PriorityBadge({ priority }: { priority: Priority }) {
  const theme = useTheme();
  const color = (
    theme.palette.mode === 'dark'
      ? { high: '#f0a28b', medium: '#dfc079', low: '#9bc6ad' }
      : { high: '#9b4634', medium: '#80601d', low: '#496957' }
  )[priority];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.65,
        color,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', gap: '2px', height: 11, alignItems: 'end' }}>
        {[0, 1, 2].map((bar) => (
          <Box
            key={bar}
            sx={{
              width: 2,
              height: 4 + bar * 3,
              bgcolor: color,
              opacity: bar <= { low: 0, medium: 1, high: 2 }[priority] ? 1 : 0.22,
            }}
          />
        ))}
      </Box>
      {priorities[priority]}
    </Box>
  );
}
