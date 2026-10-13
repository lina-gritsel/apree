import { Box, Typography } from '@mui/material';

export function Brand() {
  return (
    <Box aria-label="Apri" sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
      <Box
        component="img"
        src="/apree-logo.png"
        alt=""
        sx={{ width: 27, height: 27, objectFit: 'contain' }}
      />
      <Typography
        component="span"
        sx={{ fontSize: 17, fontWeight: 650, letterSpacing: '-.4px', whiteSpace: 'nowrap' }}
      >
        Apri
      </Typography>
    </Box>
  );
}
