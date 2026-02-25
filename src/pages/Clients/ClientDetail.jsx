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
import { useLanguage } from '../../context/LanguageContext';
import {
    formatDate,
    formatDateTime,
    formatCurrency,
    SESSION_STATUS_COLORS,
    PAYMENT_STATUS_COLORS,
    DEFAULT_SESSION_FEE,
} from '../../utils/helpers';

const emptySession = {
    date: '',
    time: '',
    duration: 50,
    status: 'scheduled',
    fee: DEFAULT_SESSION_FEE,
    sessionType: 'face_to_face',
    paymentStatus: 'pending',
    mood: '',
    notes: '',
    homework: '',
};

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getClientById, getSessionsByClient, addSession, editSession, removeSession, showSnackbar } = useApp();
    const { t, getSessionStatusLabels, getPaymentStatusLabels, getMoodOptions } = useLanguage();
    const SESSION_STATUS_LABELS = getSessionStatusLabels();
    const PAYMENT_STATUS_LABELS = getPaymentStatusLabels();
    const MOOD_OPTIONS = getMoodOptions();
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
                    {t('clientDetail.notFound')}
                </Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/clients')}>
                    {t('clientDetail.backToList')}
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
                sessionType: session.sessionType || 'face_to_face',
            });
        } else {
            setEditingSession(null);
            setSessionForm(emptySession);
        }
        setSessionDialogOpen(true);
    };

    const handleSaveSession = async () => {
        if (!sessionForm.date || !sessionForm.time) {
            showSnackbar(t('clientDetail.dateTimeRequired'), 'error');
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
                showSnackbar(t('clientDetail.sessionUpdated'));
            } else {
                await addSession(payload);
                showSnackbar(t('clientDetail.sessionAdded'));
            }
            setSessionDialogOpen(false);
        } catch (err) {
            showSnackbar(t('clientDetail.sessionError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSession = async () => {
        setSaving(true);
        try {
            await removeSession(sessionToDelete.id);
            showSnackbar(t('clientDetail.sessionDeleted'), 'warning');
            setDeleteSessionDialog(false);
            setSessionToDelete(null);
        } catch (err) {
            showSnackbar(t('clientDetail.deleteError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 2, md: 3 }, flexWrap: 'wrap' }}>
                <IconButton onClick={() => navigate('/clients')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" noWrap sx={{ fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2.125rem' } }}>
                        {client.firstName} {client.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('clientDetail.registered')}: {formatDate(client.createdAt)}
                    </Typography>
                </Box>
                <Chip label={client.isActive ? t('clients.active') : t('clients.passive')} color={client.isActive ? 'success' : 'default'} />
            </Box>

            {/* Bilgi Kartları */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
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

                <Grid size={{ xs: 12, sm: 12, md: 8 }}>
                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                        {clientSessions.length}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{t('clientDetail.totalSessions')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main" fontWeight={700}>
                                        {completedSessions.length}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{t('clientDetail.completed')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="success.main" fontWeight={700}>
                                        {formatCurrency(totalPaid)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{t('clientDetail.paid')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="warning.main" fontWeight={700}>
                                        {formatCurrency(totalPending)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{t('clientDetail.pending')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tanı & Tedavi */}
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('clientDetail.diagnosis')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{client.diagnosis || '—'}</Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('clientDetail.treatmentPlan')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{client.treatmentPlan || '—'}</Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('clientDetail.notes')}</Typography>
                            <Typography variant="body1">{client.notes || '—'}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Sekmeler */}
            <Card>
                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}
                    variant="fullWidth"
                >
                    <Tab label={t('clientDetail.sessionHistory')} />
                    <Tab label={t('clientDetail.moodChart')} />
                </Tabs>

                {tab === 0 && (
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">{t('clientDetail.sessions')}</Typography>
                            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpenSessionDialog()}>
                                {t('clientDetail.newSession')}
                            </Button>
                        </Box>
                        {clientSessions.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <EventNoteIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                <Typography color="text.secondary">{t('clientDetail.noSessions')}</Typography>
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
                                                        <Tooltip title={t('clients.edit')}>
                                                            <IconButton size="small" onClick={() => handleOpenSessionDialog(session)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={t('clients.delete')}>
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
                                                                {session.sessionType === 'online' ? '💻' : '🏢'}{' '}
                                                                {t(`calendar.sessionType.${session.sessionType || 'face_to_face'}`)}
                                                                {' • '}{session.duration} dk • {formatCurrency(session.fee)}
                                                            </Typography>
                                                            {session.notes && (
                                                                <Typography variant="body2" sx={{ mt: 0.5 }}>📝 {session.notes}</Typography>
                                                            )}
                                                            {session.homework && (
                                                                <Typography variant="body2" sx={{ mt: 0.5 }}>📚 {t('clientDetail.homework')}: {session.homework}</Typography>
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
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>{t('clientDetail.moodTracking')}</Typography>
                        {moodData.length < 2 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    {t('clientDetail.moodMinData')}
                                </Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={moodData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={12} />
                                    <RechartsTooltip
                                        formatter={(value) => {
                                            const m = MOOD_OPTIONS.find((o) => o.value === value);
                                            return [`${m?.emoji} ${m?.label}`, t('clientDetail.moodLabel')];
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
            <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth
                sx={{ '& .MuiDialog-paper': { mx: { xs: 1, sm: 2 }, width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' } } }}
            >
                <DialogTitle>{editingSession ? t('clientDetail.editSession') : t('clientDetail.addSession')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('clientDetail.date')}
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={sessionForm.date}
                                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('clientDetail.time')}
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={sessionForm.time}
                                onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('clientDetail.duration')}
                                type="number"
                                fullWidth
                                value={sessionForm.duration}
                                onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('clientDetail.fee')}
                                type="number"
                                fullWidth
                                value={sessionForm.fee}
                                onChange={(e) => setSessionForm({ ...sessionForm, fee: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('clientDetail.sessionStatus')}</InputLabel>
                                <Select
                                    value={sessionForm.status}
                                    label={t('clientDetail.sessionStatus')}
                                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                                >
                                    <MenuItem value="scheduled">{SESSION_STATUS_LABELS.scheduled}</MenuItem>
                                    <MenuItem value="completed">{SESSION_STATUS_LABELS.completed}</MenuItem>
                                    <MenuItem value="cancelled">{SESSION_STATUS_LABELS.cancelled}</MenuItem>
                                    <MenuItem value="no_show">{SESSION_STATUS_LABELS.no_show}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('clientDetail.paymentStatus')}</InputLabel>
                                <Select
                                    value={sessionForm.paymentStatus}
                                    label={t('clientDetail.paymentStatus')}
                                    onChange={(e) => setSessionForm({ ...sessionForm, paymentStatus: e.target.value })}
                                >
                                    <MenuItem value="pending">{PAYMENT_STATUS_LABELS.pending}</MenuItem>
                                    <MenuItem value="paid">{PAYMENT_STATUS_LABELS.paid}</MenuItem>
                                    <MenuItem value="partial">{PAYMENT_STATUS_LABELS.partial}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('calendar.sessionType')}</InputLabel>
                                <Select
                                    value={sessionForm.sessionType}
                                    label={t('calendar.sessionType')}
                                    onChange={(e) => setSessionForm({ ...sessionForm, sessionType: e.target.value })}
                                >
                                    <MenuItem value="face_to_face">🏢 {t('calendar.sessionType.face_to_face')}</MenuItem>
                                    <MenuItem value="online">💻 {t('calendar.sessionType.online')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('clientDetail.mood')}</InputLabel>
                                <Select
                                    value={sessionForm.mood}
                                    label={t('clientDetail.mood')}
                                    onChange={(e) => setSessionForm({ ...sessionForm, mood: e.target.value })}
                                >
                                    <MenuItem value="">{t('clientDetail.moodNone')}</MenuItem>
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
                                label={t('clientDetail.sessionNotes')}
                                fullWidth
                                multiline
                                rows={3}
                                value={sessionForm.notes}
                                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t('clientDetail.homeworkLabel')}
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
                    <Button onClick={() => setSessionDialogOpen(false)} disabled={saving}>{t('clientDetail.cancel')}</Button>
                    <Button variant="contained" onClick={handleSaveSession} disabled={saving}>
                        {saving ? t('clientDetail.saving') : editingSession ? t('clientDetail.update') : t('clientDetail.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Seans Silme Dialog */}
            <Dialog open={deleteSessionDialog} onClose={() => setDeleteSessionDialog(false)}>
                <DialogTitle>{t('clientDetail.deleteSession')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('clientDetail.deleteSessionConfirm')}</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteSessionDialog(false)} disabled={saving}>{t('clientDetail.cancel')}</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteSession} disabled={saving}>
                        {saving ? t('clientDetail.deleting') : t('clients.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientDetail;
