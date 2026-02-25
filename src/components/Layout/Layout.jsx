import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    useMediaQuery,
    useTheme,
    Avatar,
    Divider,
    Snackbar,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    CalendarMonth as CalendarIcon,
    Assessment as AssessmentIcon,
    Payments as PaymentsIcon,
    Menu as MenuIcon,
    Psychology as PsychologyIcon,
    Logout as LogoutIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_TABLET = 220;

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));    // < 600px
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')); // 600-1199px
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));     // >= 1200px
    const showTemporaryDrawer = isMobile || isTablet;
    const drawerWidth = isTablet ? DRAWER_WIDTH_TABLET : DRAWER_WIDTH;
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { snackbar, dispatch } = useApp();
    const { signOut, getUserName } = useAuth();
    const { toggleTheme, isDark } = useThemeMode();
    const { t, language, toggleLanguage } = useLanguage();

    const menuItems = [
        { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/' },
        { text: t('nav.clients'), icon: <PeopleIcon />, path: '/clients' },
        { text: t('nav.calendar'), icon: <CalendarIcon />, path: '/calendar' },
        { text: t('nav.payments'), icon: <PaymentsIcon />, path: '/payments' },
        { text: t('nav.reports'), icon: <AssessmentIcon />, path: '/reports' },
    ];

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleNavigation = (path) => {
        navigate(path);
        if (showTemporaryDrawer) setMobileOpen(false);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo ve kullanıcı bilgisi */}
            <Box
                sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: 'primary.main',
                        width: 44,
                        height: 44,
                        boxShadow: '0 4px 12px rgba(92, 107, 192, 0.3)',
                    }}
                >
                    <PsychologyIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
                        PsikoTakip
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Psk. Özlem Konağ
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Menu */}
            <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2.5,
                                    py: 1.2,
                                    bgcolor: isActive ? 'primary.main' : 'transparent',
                                    color: isActive ? 'white' : 'text.primary',
                                    '&:hover': {
                                        bgcolor: isActive ? 'primary.dark' : 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'white' : 'text.secondary',
                                        minWidth: 40,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, fontSize: '0.9rem' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />
            {/* Çıkış butonu ve copyright */}
            <Box sx={{ p: 1.5 }}>
                <ListItemButton
                    onClick={handleSignOut}
                    sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.lighter', color: 'error.dark' },
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('nav.logout')}
                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                    />
                </ListItemButton>
            </Box>
            <Box sx={{ px: 2, pb: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    {t('nav.copyright')}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar — her zaman göster, sağ üstte tema + dil + çıkış */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    ml: showTemporaryDrawer ? 0 : `${DRAWER_WIDTH}px`,
                    width: showTemporaryDrawer ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
                }}
            >
                <Toolbar>
                    {showTemporaryDrawer && (
                        <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    {showTemporaryDrawer && (
                        <>
                            <PsychologyIcon sx={{ color: 'primary.main', mr: 1 }} />
                            <Typography variant="h6" color="primary.dark" fontWeight={700} sx={{ flex: 1 }}>
                                PsikoTakip
                            </Typography>
                        </>
                    )}
                    {!showTemporaryDrawer && <Box sx={{ flex: 1 }} />}

                    {/* Dil değişimi butonu */}
                    <Tooltip title={t('lang.switch')}>
                        <IconButton
                            onClick={toggleLanguage}
                            size="small"
                            sx={{
                                mr: 0.5,
                                width: 36,
                                height: 36,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: 'text.secondary',
                            }}
                        >
                            {language === 'tr' ? 'EN' : 'TR'}
                        </IconButton>
                    </Tooltip>

                    {/* Tema değişimi butonu */}
                    <Tooltip title={isDark ? t('theme.light') : t('theme.dark')}>
                        <IconButton onClick={toggleTheme} size="small" sx={{ mr: 0.5, color: 'text.secondary' }}>
                            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {/* Çıkış butonu — drawer olmadığında AppBar'da */}
                    {showTemporaryDrawer && (
                        <Tooltip title={t('nav.logout')}>
                            <IconButton onClick={handleSignOut} color="error" size="small">
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            {showTemporaryDrawer ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    mt: 8,
                    minHeight: '100vh',
                    overflow: 'auto',
                }}
            >
                <Outlet />
            </Box>

            {/* Global Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Layout;
