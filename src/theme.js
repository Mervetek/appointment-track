import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#5C6BC0',
            light: '#8E99E8',
            dark: '#3949AB',
        },
        secondary: {
            main: '#26A69A',
            light: '#64D8CB',
            dark: '#00897B',
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
        },
        success: { main: '#43a047' },
        warning: { main: '#fb8c00' },
        error: { main: '#e53935' },
        info: { main: '#1976d2' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    backgroundColor: '#F5F5F5',
                },
            },
        },
    },
});

export default theme;
