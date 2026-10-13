import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
export function Header({ dark, onTheme }: { dark: boolean; onTheme: () => void }) {
  return (
    <Box
      component="header"
      sx={{
        height: 76,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2.5, md: 5 },
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 33,
          height: 33,
          borderRadius: '10px',
          bgcolor: '#5c57d7',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          mr: 1.2,
          boxShadow: '0 3px 8px #5c57d71a',
        }}
      >
        <CheckRounded sx={{ fontSize: 23 }} />
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 750, letterSpacing: '-.7px' }}>
        собрано<span style={{ color: '#7972e2' }}>.</span>
      </Typography>
      <Box
        sx={{
          height: 20,
          width: '1px',
          bgcolor: 'divider',
          mx: 3,
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Typography
        sx={{ fontSize: 12, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
      >
        Ваше пространство для ясности
      </Typography>
      <Box sx={{ flex: 1 }} />
      <Tooltip title={dark ? 'Светлая тема' : 'Тёмная тема'}>
        <IconButton
          aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
          onClick={onTheme}
          sx={{ color: 'text.secondary' }}
        >
          {dark ? (
            <LightModeOutlined sx={{ fontSize: 20 }} />
          ) : (
            <DarkModeOutlined sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          width: 31,
          height: 31,
          ml: 2,
          bgcolor: 'action.selected',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          fontSize: 11,
          fontWeight: 700,
        }}
        aria-label="Личное пространство"
      >
        Я
      </Box>
    </Box>
  );
}
