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
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
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
    const { t, language, getSessionStatusLabels } = useLanguage();
    const SESSION_STATUS_LABELS = getSessionStatusLabels();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Typography variant="h6" color="text.secondary">{t('dashboard.loading')}</Typography>
            </Box>
        );
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
                    {t('dashboard.welcome')}
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
