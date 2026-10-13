import { Box, Typography } from '@mui/material';

export function Brand() {
  return (
    <Box aria-label="Forma" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="svg"
        viewBox="0 0 32 32"
        aria-hidden="true"
        sx={{ width: 28, height: 28, color: 'text.primary' }}
      >
        <path fill="currentColor" d="M4 5h24v6H10v5h14v6H10v7H4z" />
        <path fill="currentColor" opacity=".35" d="M18 25h10v4H18z" />
      </Box>
      <Typography component="span" sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.8px' }}>
        forma
      </Typography>
    </Box>
  );
}
