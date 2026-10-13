import { createTheme } from '@mui/material/styles';

export const makeTheme = (mode: 'light' | 'dark') => {
  const dark = mode === 'dark';
  const surface = dark ? '#1b1b1b' : '#ffffff';
  const border = dark ? '#303030' : '#dedede';
  const hover = dark ? '#292929' : '#f2f2f2';
  const selected = dark ? '#323232' : '#eaeaea';
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
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none', '--Paper-overlay': 'none' } },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: surface,
            backgroundImage: 'none',
            border: `1px solid ${border}`,
            borderRadius: 12,
            boxShadow: '0 24px 80px #0006',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: 16, fontWeight: 600, padding: '22px 24px 16px' } },
      },
      MuiPopover: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          paper: {
            backgroundColor: surface,
            backgroundImage: 'none',
            border: `1px solid ${border}`,
            borderRadius: 8,
            boxShadow: '0 8px 28px #0005',
          },
        },
      },
      MuiMenu: { styleOverrides: { paper: { marginTop: 5 }, list: { padding: 4 } } },
      MuiSelect: { styleOverrides: { icon: { fontSize: 18, color: dark ? '#999' : '#777' } } },
      MuiChip: {
        styleOverrides: { root: { backgroundColor: hover, border: `1px solid ${border}` } },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 36, paddingInline: 14, borderRadius: 6 } },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 5 } } },
      MuiInputLabel: {
        styleOverrides: { root: { '&.Mui-focused': { color: dark ? '#a1a1a1' : '#707070' } } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: 13,
            background: surface,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: dark ? '#484848' : '#bdbdbd',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: dark ? '#666' : '#999',
            },
            '&.Mui-focused': { boxShadow: dark ? '0 0 0 2px #ffffff08' : '0 0 0 2px #00000005' },
          },
          input: { paddingTop: 8, paddingBottom: 8 },
          notchedOutline: { borderColor: dark ? '#303030' : '#e0e0e0' },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: hover },
            '&.Mui-selected, &.Mui-selected:hover, &.Mui-focusVisible': {
              backgroundColor: selected,
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            minHeight: 32,
            padding: '7px 10px',
            borderRadius: 5,
            '&:hover': { backgroundColor: hover },
            '&.Mui-selected': { backgroundColor: selected },
            '&.Mui-selected:hover, &.Mui-focusVisible, &.Mui-selected.Mui-focusVisible': {
              backgroundColor: selected,
            },
          },
        },
      },
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
