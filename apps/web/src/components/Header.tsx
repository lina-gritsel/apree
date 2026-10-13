import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { Brand } from './Brand';

export function Header({ dark, onTheme }: { dark: boolean; onTheme: () => void }) {
  return (
    <Box
      component="header"
      sx={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Brand />
      <Box
        sx={{
          width: 1,
          height: 20,
          bgcolor: 'divider',
          mx: 3,
          maxWidth: '1px',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Typography
        sx={{ fontSize: 13, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
      >
        Рабочее пространство
      </Typography>
      <Box sx={{ flex: 1 }} />
      <Tooltip title={dark ? 'Светлая тема' : 'Тёмная тема'}>
        <IconButton
          aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
          onClick={onTheme}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          {dark ? (
            <LightModeOutlined sx={{ fontSize: 19 }} />
          ) : (
            <DarkModeOutlined sx={{ fontSize: 19 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
