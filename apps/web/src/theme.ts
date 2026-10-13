import { createTheme } from '@mui/material/styles';

export const makeTheme = (mode: 'light' | 'dark') => {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#8da4ff' : '#3859c7' },
      background: { default: dark ? '#131519' : '#ffffff', paper: dark ? '#1b1e24' : '#ffffff' },
      text: { primary: dark ? '#eceef3' : '#20242d', secondary: dark ? '#a2a9b5' : '#667080' },
      divider: dark ? '#2d323c' : '#e5e8ed',
      action: { hover: dark ? '#191c22' : '#f5f6f8', selected: dark ? '#28334e' : '#edf1fc' },
    },
    shape: { borderRadius: 6 },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h5: { fontSize: 22, fontWeight: 600, letterSpacing: '-.55px' },
      button: { textTransform: 'none', fontWeight: 500, fontSize: 13 },
      body2: { fontSize: 13, lineHeight: 1.6 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 36, paddingInline: 14, borderRadius: 6 } },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 5 } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { fontSize: 13, background: dark ? '#1b1e24' : '#fff' },
          input: { paddingTop: 8, paddingBottom: 8 },
          notchedOutline: { borderColor: dark ? '#343b48' : '#e0e4eb' },
        },
      },
      MuiMenuItem: { styleOverrides: { root: { fontSize: 13 } } },
      MuiTooltip: { defaultProps: { arrow: true } },
      MuiCssBaseline: {
        styleOverrides: {
          body: { margin: 0 },
          '*': { boxSizing: 'border-box' },
          'button, a, input': { WebkitTapHighlightColor: 'transparent' },
          ':focus-visible': { outline: '2px solid #6681dd', outlineOffset: 3 },
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
};
