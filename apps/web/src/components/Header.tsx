import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
export function Header({
  dark,
  onTheme,
  count,
  done,
}: {
  dark: boolean;
  onTheme: () => void;
  count: number;
  done: number;
}) {
  return (
    <Box
      component="header"
      sx={{
        height: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <LayersOutlined sx={{ fontSize: 17, color: 'primary.main' }} />
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Forma</Typography>
      <ChevronRightRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
      <Typography component="h1" sx={{ fontSize: 13, fontWeight: 500 }}>
        Задачи
      </Typography>
      <Typography
        sx={{
          ml: 'auto',
          fontSize: 11,
          color: 'text.secondary',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {count} всего · {done} завершено
      </Typography>
      <Tooltip title={dark ? 'Светлая тема' : 'Тёмная тема'}>
        <IconButton
          aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
          onClick={onTheme}
          size="small"
          sx={{ ml: { xs: 'auto', sm: 1 }, color: 'text.secondary' }}
        >
          {dark ? (
            <LightModeOutlined sx={{ fontSize: 17 }} />
          ) : (
            <DarkModeOutlined sx={{ fontSize: 17 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
