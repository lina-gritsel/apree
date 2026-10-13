import { Box, Button, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import { Brand } from './Brand';

export function Sidebar({ onCreate }: { onCreate: () => void }) {
  return (
    <Box
      component="aside"
      sx={{
        position: 'fixed',
        inset: '0 auto 0 0',
        width: 212,
        p: 2,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
      }}
    >
      <Box sx={{ height: 48, display: 'flex', alignItems: 'center', px: 1 }}>
        <Brand />
      </Box>
      <Button
        onClick={onCreate}
        startIcon={<AddRounded />}
        color="inherit"
        sx={{ mt: 2, justifyContent: 'flex-start', color: 'text.secondary' }}
      >
        Новая задача
      </Button>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', px: 1, mt: 4, mb: 1.2 }}>
        Рабочее пространство
      </Typography>
      <Box
        aria-current="page"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'action.selected',
          borderRadius: '6px',
          px: 1.2,
          py: 1,
          fontSize: 13,
        }}
      >
        <LayersOutlined sx={{ fontSize: 17 }} />
        Задачи
      </Box>
    </Box>
  );
}
