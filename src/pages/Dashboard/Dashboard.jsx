import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Divider,
    Paper,
} from '@mui/material';
import {
    People as PeopleIcon,
    CalendarMonth as CalendarIcon,
    Payments as PaymentsIcon,
    TrendingUp as TrendingUpIcon,
    AccessTime as AccessTimeIcon,
    ArrowForward as ArrowForwardIcon,
    EventAvailable as EventAvailableIcon,
    Warning as WarningIcon,
    PersonAdd as PersonAddIcon,
    EventNote as EventNoteIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    formatTime,
    formatCurrency,
    SESSION_STATUS_COLORS,
    PAYMENT_STATUS_COLORS,
} from '../../utils/helpers';

const StatCard = ({ icon, title, value, subtitle, color, onClick }) => (
    <Card
        sx={{
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': onClick
                ? { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
                : {},
        }}
        onClick={onClick}
    >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' } }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Avatar sx={{ bgcolor: `${color}15`, color: color, width: { xs: 36, sm: 44, md: 52 }, height: { xs: 36, sm: 44, md: 52 }, ml: 1 }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

const StepCard = ({ icon, title, description, step, color }) => (
    <Card sx={{ textAlign: 'center', height: '100%', position: 'relative', overflow: 'visible' }}>
        <Box
            sx={{
                position: 'absolute',
                top: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: `0 4px 12px ${color}40`,
            }}
        >
            {step}
        </Box>
        <CardContent sx={{ pt: 4, px: 2, pb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}12`, color: color, width: 52, height: 52, mx: 'auto', mb: 1.5 }}>
                {icon}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </CardContent>
    </Card>
);

const EmptyDashboard = ({ t, userName, navigate }) => (
    <Box>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                {t('dashboard.welcome', { name: userName })}
            </Typography>
        </Box>

        {/* Hero Card */}
        <Paper
            elevation={0}
            sx={{
                textAlign: 'center',
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
                mb: { xs: 3, md: 4 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <PeopleIcon sx={{ fontSize: { xs: 56, md: 72 }, color: 'primary.main', mb: 2, opacity: 0.8 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                {t('dashboard.empty.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
                {t('dashboard.empty.subtitle')}
            </Typography>
            <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/clients')}
                sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                }}
            >
                {t('dashboard.empty.addClient')}
            </Button>
        </Paper>

        {/* Steps */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StepCard
                    step={1}
                    icon={<PersonAddIcon />}
                    title={t('dashboard.empty.step1.title')}
                    description={t('dashboard.empty.step1.desc')}
                    color="#5C6BC0"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StepCard
                    step={2}
                    icon={<EventNoteIcon />}
                    title={t('dashboard.empty.step2.title')}
                    description={t('dashboard.empty.step2.desc')}
                    color="#26A69A"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StepCard
                    step={3}
                    icon={<AssessmentIcon />}
                    title={t('dashboard.empty.step3.title')}
                    description={t('dashboard.empty.step3.desc')}
                    color="#43a047"
                />
            </Grid>
        </Grid>
    </Box>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        clients,
        sessions,
        loading,
        getTodaySessions,
        getUpcomingSessions,
        getTotalRevenue,
        getPendingPayments,
        getClientById,
    } = useApp();
    const { getUserName } = useAuth();
    const { t, language, getSessionStatusLabels } = useLanguage();
    const SESSION_STATUS_LABELS = getSessionStatusLabels();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Typography variant="h6" color="text.secondary">{t('dashboard.loading')}</Typography>
            </Box>
        );
    }

    // Empty State — henüz danışan yoksa onboarding göster
    if (clients.length === 0 && sessions.length === 0) {
        return <EmptyDashboard t={t} userName={getUserName()} navigate={navigate} />;
    }

    const todaySessions = getTodaySessions();
    const upcomingSessions = getUpcomingSessions().slice(0, 5);
    const pendingPayments = getPendingPayments();
    const totalRevenue = getTotalRevenue();
    const activeClients = clients.filter((c) => c.isActive);
    const completedThisMonth = sessions.filter((s) => {
        const d = new Date(s.date);
        const now = new Date();
        return s.status === 'completed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                    {t('dashboard.welcome', { name: getUserName() })}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('dashboard.subtitle')}
                </Typography>
            </Box>

            {/* İstatistik Kartları */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <StatCard
                        icon={<CalendarIcon />}
                        title={t('dashboard.todaySessions')}
                        value={todaySessions.length}
                        subtitle={`${todaySessions.filter((s) => s.status === 'scheduled').length} ${t('dashboard.planned')}`}
                        color="#5C6BC0"
                        onClick={() => navigate('/calendar')}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <StatCard
                        icon={<PeopleIcon />}
                        title={t('dashboard.activeClients')}
                        value={activeClients.length}
                        subtitle={`${clients.length} ${t('dashboard.total')}`}
                        color="#26A69A"
                        onClick={() => navigate('/clients')}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <StatCard
                        icon={<PaymentsIcon />}
                        title={t('dashboard.totalRevenue')}
                        value={formatCurrency(totalRevenue)}
                        subtitle={`${completedThisMonth.length} ${t('dashboard.sessionsThisMonth')}`}
                        color="#43a047"
                        onClick={() => navigate('/payments')}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <StatCard
                        icon={<WarningIcon />}
                        title={t('dashboard.pendingPayments')}
                        value={pendingPayments.length}
                        subtitle={formatCurrency(pendingPayments.reduce((sum, s) => sum + (s.fee || 0), 0))}
                        color="#fb8c00"
                        onClick={() => navigate('/payments')}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {/* Bugünkü Seanslar */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">{t('dashboard.todaySessionsTitle')}</Typography>
                                <Button size="small" onClick={() => navigate('/calendar')} endIcon={<ArrowForwardIcon />}>
                                    {t('dashboard.calendar')}
                                </Button>
                            </Box>
                            {todaySessions.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <EventAvailableIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">{t('dashboard.noAppointmentToday')}</Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {todaySessions.map((session, idx) => {
                                        const client = getClientById(session.clientId);
                                        return (
                                            <React.Fragment key={session.id}>
                                                {idx > 0 && <Divider />}
                                                <ListItem
                                                    sx={{
                                                        px: 1,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                    }}
                                                    onClick={() => navigate(`/clients/${session.clientId}`)}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                            {client ? client.firstName[0] + client.lastName[0] : '?'}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={client ? `${client.firstName} ${client.lastName}` : t('dashboard.unknown')}
                                                        secondary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                                {formatTime(session.date)} • {session.duration} {t('dashboard.min')}
                                                            </Box>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Chip
                                                            label={SESSION_STATUS_LABELS[session.status]}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: `${SESSION_STATUS_COLORS[session.status]}15`,
                                                                color: SESSION_STATUS_COLORS[session.status],
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Yaklaşan Randevular */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">{t('dashboard.upcomingTitle')}</Typography>
                            </Box>
                            {upcomingSessions.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">{t('dashboard.noUpcoming')}</Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {upcomingSessions.map((session, idx) => {
                                        const client = getClientById(session.clientId);
                                        const sessionDate = new Date(session.date);
                                        const dayStr = sessionDate.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                        });
                                        return (
                                            <React.Fragment key={session.id}>
                                                {idx > 0 && <Divider />}
                                                <ListItem
                                                    sx={{
                                                        px: 1,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                    }}
                                                    onClick={() => navigate(`/clients/${session.clientId}`)}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'secondary.light', width: 36, height: 36, fontSize: 14 }}>
                                                            {client ? client.firstName[0] : '?'}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={client ? `${client.firstName} ${client.lastName}` : t('dashboard.unknown')}
                                                        secondary={`${dayStr} • ${formatTime(session.date)}`}
                                                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                                                    />
                                                </ListItem>
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
