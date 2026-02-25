import { createTheme } from '@mui/material/styles';

const getTheme = (mode) =>
    createTheme({
        palette: {
            mode,
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
            ...(mode === 'light'
                ? {
                    background: {
                        default: '#EEEDF5',
                        paper: '#FAFAFC',
                    },
                    success: { main: '#43a047' },
                    warning: { main: '#fb8c00' },
                    error: { main: '#e53935' },
                    info: { main: '#1976d2' },
                    divider: 'rgba(92, 107, 192, 0.12)',
                }
                : {
                    background: {
                        default: '#121212',
                        paper: '#1E1E1E',
                    },
                    success: { main: '#66bb6a' },
                    warning: { main: '#ffa726' },
                    error: { main: '#ef5350' },
                    info: { main: '#42a5f5' },
                }),
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
                        boxShadow:
                            mode === 'light'
                                ? '0 2px 16px rgba(92, 107, 192, 0.10), 0 1px 4px rgba(0,0,0,0.04)'
                                : '0 2px 12px rgba(0,0,0,0.3)',
                        ...(mode === 'light' && {
                            border: '1px solid rgba(92, 107, 192, 0.08)',
                        }),
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
                        backgroundColor: mode === 'light' ? '#E8E6F0' : '#2A2A2A',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#F4F3FA' : '#1E1E1E',
                        ...(mode === 'light' && {
                            borderRight: '1px solid rgba(92, 107, 192, 0.12)',
                        }),
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        ...(mode === 'light' && {
                            backgroundColor: '#F8F7FC',
                            backdropFilter: 'blur(8px)',
                        }),
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        ...(mode === 'light' && {
                            '&:hover': {
                                backgroundColor: 'rgba(92, 107, 192, 0.08)',
                            },
                        }),
                    },
                },
            },
        },
    });

export default getTheme;
