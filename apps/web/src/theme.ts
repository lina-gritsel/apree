import { createTheme } from '@mui/material/styles';

export const makeTheme = (mode: 'light' | 'dark') => {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#7474e5' : '#5e5ece', contrastText: '#fff' },
      background: { default: dark ? '#080808' : '#f6f6f6', paper: dark ? '#1b1b1b' : '#ffffff' },
      text: { primary: dark ? '#e6e6e6' : '#242424', secondary: dark ? '#a1a1a1' : '#707070' },
      divider: dark ? '#292929' : '#e6e6e6',
      action: { hover: dark ? '#141414' : '#f5f5f5', selected: dark ? '#282828' : '#eaeaea' },
    },
    shape: { borderRadius: 6 },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h5: { fontSize: 22, fontWeight: 600, letterSpacing: '-.55px' },
      button: { textTransform: 'none', fontWeight: 500, fontSize: 13 },
      body2: { fontSize: 13, lineHeight: 1.6 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 36, paddingInline: 14, borderRadius: 6 } },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 5 } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { fontSize: 13, background: dark ? '#1b1b1b' : '#fff' },
          input: { paddingTop: 8, paddingBottom: 8 },
          notchedOutline: { borderColor: dark ? '#303030' : '#e0e0e0' },
        },
      },
      MuiMenuItem: { styleOverrides: { root: { fontSize: 13 } } },
      MuiTooltip: { defaultProps: { arrow: true } },
      MuiCssBaseline: {
        styleOverrides: {
          body: { margin: 0 },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: dark ? '#393939 transparent' : '#ccc transparent',
            boxSizing: 'border-box',
          },
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
