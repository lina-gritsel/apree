import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
export function Header({
  dark,
  onTheme,
  count,
  done,
  taskId,
  onBack,
}: {
  dark: boolean;
  onTheme: () => void;
  count: number;
  done: number;
  taskId: string | null;
  onBack: () => void;
}) {
  return (
    <Box
      component="header"
      sx={{
        height: 50,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        component="img"
        src="/apree-logo.png"
        alt=""
        sx={{ width: 18, height: 18, objectFit: 'contain' }}
      />
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Apri</Typography>
      <ChevronRightRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
      {taskId ? (
        <>
          <Button
            color="inherit"
            aria-label="Назад к задачам"
            onClick={onBack}
            sx={{ minWidth: 0, px: 0.5 }}
          >
            Задачи
          </Button>
          <ChevronRightRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            TSK-{taskId.slice(-6).toUpperCase()}
          </Typography>
        </>
      ) : (
        <Typography component="h1" sx={{ fontSize: 13, fontWeight: 500 }}>
          Задачи
        </Typography>
      )}
      <Typography
        sx={{
          ml: 'auto',
          fontSize: 11,
          color: 'text.secondary',
          display: taskId ? 'none' : { xs: 'none', sm: 'block' },
        }}
      >
        {count} всего · {done} завершено
      </Typography>
      <Tooltip title={dark ? 'Светлая тема' : 'Тёмная тема'}>
        <IconButton
          aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
          onClick={onTheme}
          size="small"
          sx={{ ml: { xs: 'auto', sm: taskId ? 'auto' : 1 }, color: 'text.secondary' }}
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
