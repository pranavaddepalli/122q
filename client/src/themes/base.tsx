// See https://mui.com/material-ui/customization/default-theme for customization options
import {createTheme} from '@mui/material';
declare module '@mui/material/styles' {
    interface Theme {
        alternateColors: {
            cancel: string;
            unfreeze: string;
            navbar: string;
            darkerPrimary: string;
            alternatePaper: string;
        }
    }
    interface ThemeOptions {
        alternateColors?: {
            cancel?: string;
            unfreeze?: string;
            navbar?: string;
            darkerPrimary?: string;
            alternatePaper?: string;
        }
    }
}

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      // main: '#EF8EC3',
      main: '#014122',
    },
    secondary: {
      main: '#f4cd2a',
    },
    success: {
      main: '#43a047',
    },
    error: {
      main: '#F27685',
    },
    info: {
      main: '#5DB7DE',
    },
    background: {
      paper: '#F0F0F0',
    },
  },
  alternateColors: {
    alternatePaper: '#fff',
    cancel: '#9e9e9e',
    unfreeze: '#ba68c8',
    // navbar: '#EF8EC3',
    navbar: '#014122',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ownerState}) => ({
          ...(ownerState.variant === 'contained' && {
            color: '#fff',
            padding: '5px 20px',
          }),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: () => ({
          ...({
            padding: '32px',
          }),
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: () => ({
          ...({
            fontSize: '15px',
          }),
        }),
      },
    },
  },
  typography: {
    fontSize: 15,
    htmlFontSize: 15,
    h1: {
      fontSize: '6rem',
    },
    h2: {
      fontSize: '3.75rem',
    },
    h3: {
      fontSize: '3rem',
    },
    h4: {
      fontSize: '2.125rem',
    },
    h5: {
      fontSize: '1.5rem',
    },
    h6: {
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontSize: '0.875rem',
    },
  },
});

const darkThemeTextColor = '#fff';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      // main: '#EF8EC3',
      main: '#014122',
    },
    secondary: {
      main: '#f4cd2a',
    },
    success: {
      main: '#09e312',
    },
    error: {
      main: '#fc3a51',
    },
    info: {
      main: '#5DB7DE',
    },
    background: {
      paper: '#444444',
      default: '#1a1919',
    },
  },
  alternateColors: {
    // darkerPrimary: '#e36bac',
    darkerPrimary: '#014122',
    alternatePaper: '#575757',
    cancel: '#9e9e9e',
    unfreeze: '#ba68c8',
    // navbar: '#e36bac',
    navbar: '#014122',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ownerState}) => ({
          ...(ownerState.variant === 'contained' && {
            color: '#fff',
            padding: '5px 20px',
          }),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: () => ({
          ...({
            padding: '32px',
          }),
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: () => ({
          ...({
            fontSize: '15px',
          }),
        }),
      },
    },
  },
  typography: {
    fontSize: 15,
    htmlFontSize: 15,
    h1: {
      fontSize: '6rem',
      color: darkThemeTextColor,
    },
    h2: {
      fontSize: '3.75rem',
      color: darkThemeTextColor,
    },
    h3: {
      fontSize: '3rem',
      color: darkThemeTextColor,
    },
    h4: {
      fontSize: '2.125rem',
      color: darkThemeTextColor,
    },
    h5: {
      fontSize: '1.5rem',
      color: darkThemeTextColor,
    },
    h6: {
      fontSize: '1.25rem',
      color: darkThemeTextColor,
    },
    body1: {
      fontSize: '1rem',
      color: darkThemeTextColor,
    },
    body2: {
      fontSize: '0.875rem',
      color: darkThemeTextColor,
    },
    button: {
      fontSize: '0.875rem',
      color: darkThemeTextColor,
    },
  },
});

export {lightTheme, darkTheme};
