import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Payments as PaymentsIcon,
    CheckCircle as CheckIcon,
    HourglassEmpty as PendingIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    formatDate,
    formatDateTime,
    formatCurrency,
    PAYMENT_STATUS_COLORS,
} from '../../utils/helpers';

const Payments = () => {
    const navigate = useNavigate();
    const { sessions, getClientById, editSession, showSnackbar } = useApp();
    const { t, getSessionStatusLabels, getPaymentStatusLabels } = useLanguage();
    const SESSION_STATUS_LABELS = getSessionStatusLabels();
    const PAYMENT_STATUS_LABELS = getPaymentStatusLabels();
    const [filter, setFilter] = useState('all');

    const paymentSessions = useMemo(() => {
        let filtered = sessions.filter((s) => s.status === 'completed' || s.status === 'scheduled');
        if (filter === 'paid') filtered = filtered.filter((s) => s.paymentStatus === 'paid');
        if (filter === 'pending') filtered = filtered.filter((s) => s.paymentStatus === 'pending');
        if (filter === 'partial') filtered = filtered.filter((s) => s.paymentStatus === 'partial');
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sessions, filter]);

    const totalPaid = sessions.filter((s) => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.fee || 0), 0);
    const totalPending = sessions
        .filter((s) => s.paymentStatus === 'pending' && (s.status === 'completed' || s.status === 'scheduled'))
        .reduce((sum, s) => sum + (s.fee || 0), 0);
    const totalAll = totalPaid + totalPending;

    const handlePaymentUpdate = async (sessionId, newStatus) => {
        try {
            await editSession({ id: sessionId, paymentStatus: newStatus });
            showSnackbar(newStatus === 'paid' ? t('payments.paidSuccess') : t('payments.updated'));
        } catch (err) {
            showSnackbar(t('payments.error'), 'error');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>{t('payments.title')}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('payments.subtitle')}
                </Typography>
            </Box>

            {/* Özet Kartlar */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Avatar sx={{ bgcolor: '#43a04715', color: '#43a047', width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 } }}>
                                <CheckIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" color="text.secondary" noWrap>{t('payments.totalPaid')}</Typography>
                                <Typography variant="h5" fontWeight={700} color="success.main" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                    {formatCurrency(totalPaid)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Avatar sx={{ bgcolor: '#fb8c0015', color: '#fb8c00', width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 } }}>
                                <PendingIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" color="text.secondary" noWrap>{t('payments.totalPending')}</Typography>
                                <Typography variant="h5" fontWeight={700} color="warning.main" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                    {formatCurrency(totalPending)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Avatar sx={{ bgcolor: '#5C6BC015', color: '#5C6BC0', width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 } }}>
                                <TrendingUpIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" color="text.secondary" noWrap>{t('payments.totalAll')}</Typography>
                                <Typography variant="h5" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                    {formatCurrency(totalAll)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtre */}
            <Card sx={{ mb: { xs: 2, md: 3 } }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={(e, v) => v && setFilter(v)}
                        size="small"
                        sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } } }}
                    >
                        <ToggleButton value="all">{t('payments.all')} ({sessions.length})</ToggleButton>
                        <ToggleButton value="paid">
                            {t('payments.paid')} ({sessions.filter((s) => s.paymentStatus === 'paid').length})
                        </ToggleButton>
                        <ToggleButton value="pending">
                            {t('payments.pending')} ({sessions.filter((s) => s.paymentStatus === 'pending').length})
                        </ToggleButton>
                        <ToggleButton value="partial">
                            {t('payments.partial')} ({sessions.filter((s) => s.paymentStatus === 'partial').length})
                        </ToggleButton>
                    </ToggleButtonGroup>
                </CardContent>
            </Card>

            {/* Tablo */}
            <Card>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('payments.client')}</TableCell>
                                <TableCell>{t('payments.date')}</TableCell>
                                <TableCell align="right">{t('payments.fee')}</TableCell>
                                <TableCell align="center">{t('payments.sessionStatus')}</TableCell>
                                <TableCell align="center">{t('payments.paymentStatus')}</TableCell>
                                <TableCell align="center">{t('payments.action')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paymentSessions.map((session) => {
                                const client = getClientById(session.clientId);
                                return (
                                    <TableRow key={session.id} hover>
                                        <TableCell>
                                            <Box
                                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                                                onClick={() => navigate(`/clients/${session.clientId}`)}
                                            >
                                                <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: 14 }}>
                                                    {client ? client.firstName[0] : '?'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {client ? `${client.firstName} ${client.lastName}` : t('payments.client')}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatDateTime(session.date)}</TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight={600}>{formatCurrency(session.fee)}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={SESSION_STATUS_LABELS[session.status]} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={PAYMENT_STATUS_LABELS[session.paymentStatus]}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${PAYMENT_STATUS_COLORS[session.paymentStatus]}15`,
                                                    color: PAYMENT_STATUS_COLORS[session.paymentStatus],
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {session.paymentStatus !== 'paid' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => handlePaymentUpdate(session.id, 'paid')}
                                                >
                                                    {t('payments.markPaid')}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {paymentSessions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">{t('payments.noRecords')}</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default Payments;
