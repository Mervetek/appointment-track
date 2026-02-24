import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Chip,
    Button,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Tabs,
    Tab,
    Paper,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Cake as CakeIcon,
    Person as PersonIcon,
    Warning as WarningIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    EventNote as EventNoteIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
    formatDate,
    formatDateTime,
    formatCurrency,
    SESSION_STATUS_LABELS,
    SESSION_STATUS_COLORS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    MOOD_OPTIONS,
    DEFAULT_SESSION_FEE,
} from '../../utils/helpers';

const emptySession = {
    date: '',
    time: '',
    duration: 50,
    status: 'scheduled',
    fee: DEFAULT_SESSION_FEE,
    paymentStatus: 'pending',
    mood: '',
    notes: '',
    homework: '',
};

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getClientById, getSessionsByClient, addSession, editSession, removeSession, showSnackbar } = useApp();
    const client = getClientById(id);
    const clientSessions = getSessionsByClient(id);

    const [tab, setTab] = useState(0);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [sessionForm, setSessionForm] = useState(emptySession);
    const [deleteSessionDialog, setDeleteSessionDialog] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [saving, setSaving] = useState(false);

    if (!client) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary">
                    Danışan bulunamadı
                </Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/clients')}>
                    Danışan Listesine Dön
                </Button>
            </Box>
        );
    }

    const completedSessions = clientSessions.filter((s) => s.status === 'completed');
    const totalPaid = clientSessions.filter((s) => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.fee || 0), 0);
    const totalPending = clientSessions.filter((s) => s.paymentStatus === 'pending' && s.status === 'completed').reduce((sum, s) => sum + (s.fee || 0), 0);

    // Mood grafiği verisi
    const moodData = completedSessions
        .filter((s) => s.mood)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((s, idx) => ({
            name: `Seans ${idx + 1}`,
            mood: s.mood,
            date: formatDate(s.date),
            emoji: MOOD_OPTIONS.find((m) => m.value === s.mood)?.emoji || '',
        }));

    const handleOpenSessionDialog = (session = null) => {
        if (session) {
            const d = new Date(session.date);
            setEditingSession(session);
            setSessionForm({
                ...session,
                date: d.toISOString().split('T')[0],
                time: d.toTimeString().slice(0, 5),
                mood: session.mood || '',
            });
        } else {
            setEditingSession(null);
            setSessionForm(emptySession);
        }
        setSessionDialogOpen(true);
    };

    const handleSaveSession = async () => {
        if (!sessionForm.date || !sessionForm.time) {
            showSnackbar('Tarih ve saat zorunludur', 'error');
            return;
        }
        const dateTime = new Date(`${sessionForm.date}T${sessionForm.time}`).toISOString();
        const payload = {
            ...sessionForm,
            clientId: id,
            date: dateTime,
            duration: Number(sessionForm.duration),
            fee: Number(sessionForm.fee),
            mood: sessionForm.mood ? Number(sessionForm.mood) : null,
        };
        delete payload.time;

        setSaving(true);
        try {
            if (editingSession) {
                await editSession({ ...payload, id: editingSession.id });
                showSnackbar('Seans güncellendi');
            } else {
                await addSession(payload);
                showSnackbar('Yeni seans eklendi');
            }
            setSessionDialogOpen(false);
        } catch (err) {
            showSnackbar('İşlem sırasında hata oluştu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSession = async () => {
        setSaving(true);
        try {
            await removeSession(sessionToDelete.id);
            showSnackbar('Seans silindi', 'warning');
            setDeleteSessionDialog(false);
            setSessionToDelete(null);
        } catch (err) {
            showSnackbar('Silme sırasında hata oluştu', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/clients')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4">
                        {client.firstName} {client.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Kayıt: {formatDate(client.createdAt)}
                    </Typography>
                </Box>
                <Chip label={client.isActive ? 'Aktif' : 'Pasif'} color={client.isActive ? 'success' : 'default'} />
            </Box>

            {/* Bilgi Kartları */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: 24 }}>
                                    {client.firstName[0]}{client.lastName[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{client.firstName} {client.lastName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{client.gender}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{client.phone}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{client.email || '—'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CakeIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{client.birthDate ? formatDate(client.birthDate) : '—'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{client.emergencyContact || '—'}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                        {clientSessions.length}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Toplam Seans</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main" fontWeight={700}>
                                        {completedSessions.length}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Tamamlanan</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="success.main" fontWeight={700}>
                                        {formatCurrency(totalPaid)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Ödenen</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="warning.main" fontWeight={700}>
                                        {formatCurrency(totalPending)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Bekleyen</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tanı & Tedavi */}
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tanı</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{client.diagnosis || '—'}</Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tedavi Planı</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{client.treatmentPlan || '—'}</Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notlar</Typography>
                            <Typography variant="body1">{client.notes || '—'}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Sekmeler */}
            <Card>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab label="Seans Geçmişi" />
                    <Tab label="Ruh Hali Grafiği" />
                </Tabs>

                {tab === 0 && (
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Seanslar</Typography>
                            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpenSessionDialog()}>
                                Yeni Seans
                            </Button>
                        </Box>
                        {clientSessions.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <EventNoteIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                <Typography color="text.secondary">Henüz seans kaydı yok</Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {clientSessions.map((session, idx) => {
                                    const moodItem = MOOD_OPTIONS.find((m) => m.value === session.mood);
                                    return (
                                        <React.Fragment key={session.id}>
                                            {idx > 0 && <Divider />}
                                            <ListItem
                                                sx={{ px: 1, py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                                                secondaryAction={
                                                    <Box>
                                                        <Tooltip title="Düzenle">
                                                            <IconButton size="small" onClick={() => handleOpenSessionDialog(session)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Sil">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => { setSessionToDelete(session); setDeleteSessionDialog(true); }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                }
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                            <Typography variant="body1" fontWeight={600}>
                                                                {formatDateTime(session.date)}
                                                            </Typography>
                                                            <Chip
                                                                label={SESSION_STATUS_LABELS[session.status]}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: `${SESSION_STATUS_COLORS[session.status]}15`,
                                                                    color: SESSION_STATUS_COLORS[session.status],
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                            <Chip
                                                                label={PAYMENT_STATUS_LABELS[session.paymentStatus]}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: `${PAYMENT_STATUS_COLORS[session.paymentStatus]}15`,
                                                                    color: PAYMENT_STATUS_COLORS[session.paymentStatus],
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                            {moodItem && (
                                                                <Typography variant="body2">{moodItem.emoji} {moodItem.label}</Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {session.duration} dk • {formatCurrency(session.fee)}
                                                            </Typography>
                                                            {session.notes && (
                                                                <Typography variant="body2" sx={{ mt: 0.5 }}>📝 {session.notes}</Typography>
                                                            )}
                                                            {session.homework && (
                                                                <Typography variant="body2" sx={{ mt: 0.5 }}>📚 Ödev: {session.homework}</Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </CardContent>
                )}

                {tab === 1 && (
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Ruh Hali Takibi</Typography>
                        {moodData.length < 2 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    Grafik için en az 2 seans mood verisi gerekli
                                </Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={moodData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                                    <RechartsTooltip
                                        formatter={(value) => {
                                            const m = MOOD_OPTIONS.find((o) => o.value === value);
                                            return [`${m?.emoji} ${m?.label}`, 'Ruh Hali'];
                                        }}
                                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="mood"
                                        stroke="#5C6BC0"
                                        strokeWidth={3}
                                        dot={{ fill: '#5C6BC0', r: 6 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Seans Ekleme/Düzenleme Dialog */}
            <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSession ? 'Seans Düzenle' : 'Yeni Seans Ekle'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Tarih"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={sessionForm.date}
                                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Saat"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={sessionForm.time}
                                onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Süre (dk)"
                                type="number"
                                fullWidth
                                value={sessionForm.duration}
                                onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Ücret (₺)"
                                type="number"
                                fullWidth
                                value={sessionForm.fee}
                                onChange={(e) => setSessionForm({ ...sessionForm, fee: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Durum</InputLabel>
                                <Select
                                    value={sessionForm.status}
                                    label="Durum"
                                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                                >
                                    <MenuItem value="scheduled">Planlandı</MenuItem>
                                    <MenuItem value="completed">Tamamlandı</MenuItem>
                                    <MenuItem value="cancelled">İptal Edildi</MenuItem>
                                    <MenuItem value="no_show">Gelmedi</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Ödeme Durumu</InputLabel>
                                <Select
                                    value={sessionForm.paymentStatus}
                                    label="Ödeme Durumu"
                                    onChange={(e) => setSessionForm({ ...sessionForm, paymentStatus: e.target.value })}
                                >
                                    <MenuItem value="pending">Bekliyor</MenuItem>
                                    <MenuItem value="paid">Ödendi</MenuItem>
                                    <MenuItem value="partial">Kısmi</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Ruh Hali</InputLabel>
                                <Select
                                    value={sessionForm.mood}
                                    label="Ruh Hali"
                                    onChange={(e) => setSessionForm({ ...sessionForm, mood: e.target.value })}
                                >
                                    <MenuItem value="">Seçilmedi</MenuItem>
                                    {MOOD_OPTIONS.map((m) => (
                                        <MenuItem key={m.value} value={m.value}>
                                            {m.emoji} {m.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Seans Notları"
                                fullWidth
                                multiline
                                rows={3}
                                value={sessionForm.notes}
                                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Ev Ödevi"
                                fullWidth
                                multiline
                                rows={2}
                                value={sessionForm.homework}
                                onChange={(e) => setSessionForm({ ...sessionForm, homework: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setSessionDialogOpen(false)} disabled={saving}>İptal</Button>
                    <Button variant="contained" onClick={handleSaveSession} disabled={saving}>
                        {saving ? 'Kaydediliyor...' : editingSession ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Seans Silme Dialog */}
            <Dialog open={deleteSessionDialog} onClose={() => setDeleteSessionDialog(false)}>
                <DialogTitle>Seansı Sil</DialogTitle>
                <DialogContent>
                    <Typography>Bu seans kaydını silmek istediğinize emin misiniz?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteSessionDialog(false)} disabled={saving}>İptal</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteSession} disabled={saving}>
                        {saving ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientDetail;
