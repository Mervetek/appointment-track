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
    Link,
} from '@mui/material';
import {
    Psychology as PsychologyIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    PersonAdd as PersonAddIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Badge as BadgeIcon,
    Work as WorkIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeMode } from '../../context/ThemeContext';

const Login = () => {
    const { signIn, signUp } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const { toggleTheme, isDark } = useThemeMode();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [title, setTitle] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setTitle('');
        setError('');
    };

    const handleToggleMode = () => {
        resetForm();
        setIsRegister(!isRegister);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError(t('login.error.empty'));
            return;
        }

        if (isRegister) {
            if (!fullName.trim()) {
                setError(t('login.error.nameRequired'));
                return;
            }
            if (password.length < 4) {
                setError(t('login.error.passwordShort'));
                return;
            }
            if (password !== confirmPassword) {
                setError(t('login.error.passwordMismatch'));
                return;
            }
        }

        setLoading(true);
        try {
            if (isRegister) {
                const { error: authError } = await signUp(
                    username.trim(),
                    password,
                    fullName.trim(),
                    title.trim()
                );
                if (authError) {
                    if (authError.message === 'username_exists') {
                        setError(t('login.error.usernameExists'));
                    } else {
                        setError(authError.message);
                    }
                }
            } else {
                const { error: authError } = await signIn(username.trim(), password);
                if (authError) {
                    if (authError.message === 'invalid_credentials') {
                        setError(t('login.error.invalidCredentials'));
                    } else {
                        setError(authError.message);
                    }
                }
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
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                                    {isRegister ? t('login.registerDivider') : t('login.divider')}
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
                            {isRegister && (
                                <>
                                    <TextField
                                        fullWidth
                                        label={t('login.fullName')}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BadgeIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        autoFocus
                                    />
                                    <TextField
                                        fullWidth
                                        label={t('login.titleField')}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        sx={{ mb: 2 }}
                                        placeholder={t('login.titlePlaceholder')}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <WorkIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </>
                            )}

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
                                autoFocus={!isRegister}
                            />

                            <TextField
                                fullWidth
                                label={t('login.password')}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: isRegister ? 2 : 3 }}
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

                            {isRegister && (
                                <TextField
                                    fullWidth
                                    label={t('login.confirmPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={
                                    loading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : isRegister ? (
                                        <PersonAddIcon />
                                    ) : (
                                        <LoginIcon />
                                    )
                                }
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    background: isRegister
                                        ? 'linear-gradient(135deg, #26A69A, #00897B)'
                                        : 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                                    boxShadow: isRegister
                                        ? '0 4px 16px rgba(38, 166, 154, 0.4)'
                                        : '0 4px 16px rgba(92, 107, 192, 0.4)',
                                    '&:hover': {
                                        background: isRegister
                                            ? 'linear-gradient(135deg, #00897B, #00695C)'
                                            : 'linear-gradient(135deg, #3949AB, #283593)',
                                        boxShadow: isRegister
                                            ? '0 6px 20px rgba(38, 166, 154, 0.5)'
                                            : '0 6px 20px rgba(92, 107, 192, 0.5)',
                                    },
                                }}
                            >
                                {loading
                                    ? isRegister
                                        ? t('login.registering')
                                        : t('login.loading')
                                    : isRegister
                                        ? t('login.register')
                                        : t('login.submit')
                                }
                            </Button>
                        </Box>

                        {/* Mod değiştirme */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                {isRegister ? t('login.hasAccount') : t('login.noAccount')}{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={handleToggleMode}
                                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                                >
                                    {isRegister ? t('login.switchToLogin') : t('login.switchToRegister')}
                                </Link>
                            </Typography>
                        </Box>

                        {/* Alt bilgi */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
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
