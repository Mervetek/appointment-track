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
import {
    formatDate,
    formatDateTime,
    formatCurrency,
    SESSION_STATUS_LABELS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
} from '../../utils/helpers';

const Payments = () => {
    const navigate = useNavigate();
    const { sessions, getClientById, editSession, showSnackbar } = useApp();
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
            showSnackbar(newStatus === 'paid' ? 'Ödeme alındı ✓' : 'Ödeme durumu güncellendi');
        } catch (err) {
            showSnackbar('Güncelleme sırasında hata oluştu', 'error');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4">Ödemeler</Typography>
                <Typography variant="body2" color="text.secondary">
                    Ödeme durumlarını takip edin
                </Typography>
            </Box>

            {/* Özet Kartlar */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#43a04715', color: '#43a047', width: 52, height: 52 }}>
                                <CheckIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Ödenen</Typography>
                                <Typography variant="h5" fontWeight={700} color="success.main">
                                    {formatCurrency(totalPaid)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#fb8c0015', color: '#fb8c00', width: 52, height: 52 }}>
                                <PendingIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Bekleyen</Typography>
                                <Typography variant="h5" fontWeight={700} color="warning.main">
                                    {formatCurrency(totalPending)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#5C6BC015', color: '#5C6BC0', width: 52, height: 52 }}>
                                <TrendingUpIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Toplam</Typography>
                                <Typography variant="h5" fontWeight={700} color="primary">
                                    {formatCurrency(totalAll)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtre */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={(e, v) => v && setFilter(v)}
                        size="small"
                    >
                        <ToggleButton value="all">Tümü ({sessions.length})</ToggleButton>
                        <ToggleButton value="paid">
                            Ödendi ({sessions.filter((s) => s.paymentStatus === 'paid').length})
                        </ToggleButton>
                        <ToggleButton value="pending">
                            Bekliyor ({sessions.filter((s) => s.paymentStatus === 'pending').length})
                        </ToggleButton>
                        <ToggleButton value="partial">
                            Kısmi ({sessions.filter((s) => s.paymentStatus === 'partial').length})
                        </ToggleButton>
                    </ToggleButtonGroup>
                </CardContent>
            </Card>

            {/* Tablo */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Danışan</TableCell>
                                <TableCell>Tarih</TableCell>
                                <TableCell align="right">Ücret</TableCell>
                                <TableCell align="center">Seans Durumu</TableCell>
                                <TableCell align="center">Ödeme Durumu</TableCell>
                                <TableCell align="center">İşlem</TableCell>
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
                                                    {client ? `${client.firstName} ${client.lastName}` : 'Bilinmeyen'}
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
                                                    Ödendi ✓
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {paymentSessions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">Kayıt bulunamadı</Typography>
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
