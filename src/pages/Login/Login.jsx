import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Avatar,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
    Fade,
    Tooltip,
} from '@mui/material';
import {
    Psychology as PsychologyIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeMode } from '../../context/ThemeContext';

const Login = () => {
    const { signIn } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const { toggleTheme, isDark } = useThemeMode();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError(t('login.error.empty'));
            return;
        }

        setLoading(true);
        try {
            const { error: authError } = await signIn(username.trim(), password);
            if (authError) {
                setError(authError.message);
            }
        } catch (err) {
            setError(t('login.error.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Sağ üst köşe: Dil + Tema butonları */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5, zIndex: 10 }}>
                <Tooltip title={t('lang.switch')}>
                    <IconButton
                        onClick={toggleLanguage}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: 'white',
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                        }}
                    >
                        {language === 'tr' ? 'EN' : 'TR'}
                    </IconButton>
                </Tooltip>
                <Tooltip title={isDark ? t('theme.light') : t('theme.dark')}>
                    <IconButton
                        onClick={toggleTheme}
                        size="small"
                        sx={{
                            color: 'white',
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                        }}
                    >
                        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>
            {/* Dekoratif arka plan daireleri */}
            <Box
                sx={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    top: -100,
                    right: -100,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    bottom: -80,
                    left: -80,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    top: '40%',
                    left: '15%',
                }}
            />

            <Fade in timeout={800}>
                <Card
                    sx={{
                        maxWidth: { xs: 440, sm: 480 },
                        width: { xs: '92%', sm: '80%', md: '90%' },
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        overflow: 'visible',
                        position: 'relative',
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 4, sm: 5 } }}>
                        {/* Logo ve başlık */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Avatar
                                sx={{
                                    width: 72,
                                    height: 72,
                                    bgcolor: 'primary.main',
                                    mx: 'auto',
                                    mb: 2,
                                    boxShadow: '0 8px 24px rgba(92, 107, 192, 0.4)',
                                }}
                            >
                                <PsychologyIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography
                                variant="h4"
                                fontWeight={800}
                                sx={{
                                    background: 'linear-gradient(135deg, #5C6BC0, #26A69A)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                PsikoTakip
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {t('login.subtitle')}
                            </Typography>

                            <Divider sx={{ my: 3 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {t('login.divider')}
                                </Typography>
                            </Divider>
                        </Box>

                        {/* Hata mesajı */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label={t('login.username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                autoFocus
                            />

                            <TextField
                                fullWidth
                                label={t('login.password')}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                                    boxShadow: '0 4px 16px rgba(92, 107, 192, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #3949AB, #283593)',
                                        boxShadow: '0 6px 20px rgba(92, 107, 192, 0.5)',
                                    },
                                }}
                            >
                                {loading ? t('login.loading') : t('login.submit')}
                            </Button>
                        </Box>

                        {/* Alt bilgi */}
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="caption" color="text.disabled">
                                {t('login.copyright')}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Fade>
        </Box>
    );
};

export default Login;
