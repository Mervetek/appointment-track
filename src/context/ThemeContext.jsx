import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const stored = localStorage.getItem('psikotakip_theme');
        return stored === 'dark' ? 'dark' : 'light';
    });

    const theme = useMemo(() => getTheme(mode), [mode]);

    const toggleTheme = () => {
        setMode((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('psikotakip_theme', next);
            return next;
        });
    };

    const isDark = mode === 'dark';

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, isDark }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeProvider');
    }
    return context;
};
