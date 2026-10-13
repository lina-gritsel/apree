import { createTheme } from '@mui/material/styles';
export const makeTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#5c57d7' : '#aaa5ff' },
      background: {
        default: mode === 'light' ? '#f7f7f4' : '#17181d',
        paper: mode === 'light' ? '#ffffff' : '#22232b',
      },
      text: {
        primary: mode === 'light' ? '#272931' : '#eeeef5',
        secondary: mode === 'light' ? '#656873' : '#a4a5b5',
      },
      divider: mode === 'light' ? '#e6e6e5' : '#353640',
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h3: { fontWeight: 650, letterSpacing: '-1.6px' },
      h5: { fontWeight: 650, letterSpacing: '-0.6px' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.1px' },
      body2: { fontSize: 13, lineHeight: 1.65 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 40, paddingInline: 16 } },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 9 } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { fontSize: 14, background: mode === 'light' ? '#fff' : '#22232b' },
          notchedOutline: { borderColor: mode === 'light' ? '#e2e3e7' : '#454650' },
        },
      },
      MuiTooltip: { defaultProps: { arrow: true } },
      MuiCssBaseline: {
        styleOverrides: {
          body: { margin: 0 },
          '*': { boxSizing: 'border-box' },
          'button, a, input': { WebkitTapHighlightColor: 'transparent' },
          ':focus-visible': { outline: '3px solid #8d86ee', outlineOffset: 3 },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },
    },
  });
