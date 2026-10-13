import { Box, Typography } from '@mui/material';
export function BoardIntro({ done, total }: { done: number; total: number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'space-between',
        gap: 3,
        mb: 4.5,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1.7,
            color: 'text.secondary',
            textTransform: 'uppercase',
            mb: 1.7,
          }}
        >
          Личное пространство / Обзор
        </Typography>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 32, md: 40 }, mb: 1.1 }}>
          Большие планы.
          <br />
          Маленькие шаги<span style={{ color: '#7972e2' }}>.</span>
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          Соберите мысли в задачи. Остальное — по порядку.
        </Typography>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' }, pt: 3, minWidth: 174 }}>
        <Typography
          sx={{
            fontSize: 10,
            letterSpacing: 1.4,
            color: 'text.secondary',
            textTransform: 'uppercase',
            mb: 1.1,
          }}
        >
          Ваш прогресс
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.7 }}>
          <Typography sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-1px' }}>
            {String(done).padStart(2, '0')}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 12 }}>
            из {total} завершено
          </Typography>
        </Box>
        <Box
          role="progressbar"
          aria-label="Завершённые задачи"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={Math.max(total, 1)}
          sx={{
            mt: 1.5,
            height: 4,
            width: 174,
            bgcolor: 'action.hover',
            borderRadius: 9,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: (total ? (done / total) * 100 : 0) + '%',
              height: '100%',
              bgcolor: 'primary.main',
              transition: 'width .3s',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
