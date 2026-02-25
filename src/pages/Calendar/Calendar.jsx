import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Avatar,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    SESSION_STATUS_COLORS,
    DEFAULT_SESSION_FEE,
    formatDateTime,
    formatCurrency,
} from '../../utils/helpers';

const Calendar = () => {
    const navigate = useNavigate();
    const { sessions, clients, addSession, getClientById, showSnackbar } = useApp();
    const { t, language, getSessionStatusLabels, getPaymentStatusLabels } = useLanguage();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    const SESSION_STATUS_LABELS = getSessionStatusLabels();
    const PAYMENT_STATUS_LABELS = getPaymentStatusLabels();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSession, setNewSession] = useState({
        clientId: '',
        date: '',
        time: '',
        duration: 50,
        fee: DEFAULT_SESSION_FEE,
        status: 'scheduled',
        paymentStatus: 'pending',
        notes: '',
    });

    const events = useMemo(
        () =>
            sessions.map((s) => {
                const client = getClientById(s.clientId);
                return {
                    id: s.id,
                    title: client ? `${client.firstName} ${client.lastName}` : t('calendar.unknown'),
                    start: s.date,
                    end: new Date(new Date(s.date).getTime() + s.duration * 60000).toISOString(),
                    backgroundColor: SESSION_STATUS_COLORS[s.status] || '#1976d2',
                    borderColor: SESSION_STATUS_COLORS[s.status] || '#1976d2',
                    extendedProps: { session: s, client },
                };
            }),
        [sessions, getClientById]
    );

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
        setDetailDialogOpen(true);
    };

    const handleDateClick = (info) => {
        setNewSession((prev) => ({
            ...prev,
            date: info.dateStr.split('T')[0],
            time: info.dateStr.includes('T') ? info.dateStr.split('T')[1]?.slice(0, 5) || '10:00' : '10:00',
        }));
        setAddDialogOpen(true);
    };

    const handleAddSession = async () => {
        if (!newSession.clientId || !newSession.date || !newSession.time) {
            showSnackbar(t('calendar.required'), 'error');
            return;
        }
        setSaving(true);
        try {
            const dateTime = new Date(`${newSession.date}T${newSession.time}`).toISOString();
            await addSession({
                ...newSession,
                date: dateTime,
                duration: Number(newSession.duration),
                fee: Number(newSession.fee),
                mood: null,
                homework: '',
            });
            showSnackbar(t('calendar.added'));
            setAddDialogOpen(false);
            setNewSession({
                clientId: '',
                date: '',
                time: '',
                duration: 50,
                fee: DEFAULT_SESSION_FEE,
                status: 'scheduled',
                paymentStatus: 'pending',
                notes: '',
            });
        } catch (err) {
            showSnackbar(t('calendar.error'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 3 }, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>{t('calendar.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('calendar.subtitle')}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
                    {t('calendar.newAppointment')}
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={isSmall ? 'timeGridDay' : 'timeGridWeek'}
                        headerToolbar={isSmall
                            ? {
                                left: 'prev,next',
                                center: 'title',
                                right: 'timeGridDay,timeGridWeek',
                            }
                            : {
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                        locale={language === 'tr' ? 'tr' : 'en'}
                        events={events}
                        eventClick={handleEventClick}
                        dateClick={handleDateClick}
                        height="auto"
                        slotMinTime="08:00:00"
                        slotMaxTime="21:00:00"
                        allDaySlot={false}
                        slotDuration="00:30:00"
                        nowIndicator={true}
                        buttonText={{
                            today: t('calendar.today'),
                            month: t('calendar.month'),
                            week: t('calendar.week'),
                            day: t('calendar.day'),
                        }}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        }}
                    />
                </CardContent>
            </Card>

            {/* Seans Detay Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('calendar.sessionDetail')}</DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <Box sx={{ pt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {selectedEvent.client?.firstName?.[0] || '?'}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">
                                        {selectedEvent.client
                                            ? `${selectedEvent.client.firstName} ${selectedEvent.client.lastName}`
                                            : t('calendar.unknown')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDateTime(selectedEvent.session.date)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">{t('calendar.duration')}</Typography>
                                    <Typography>{selectedEvent.session.duration} {t('calendar.minutes')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">{t('calendar.fee')}</Typography>
                                    <Typography>{formatCurrency(selectedEvent.session.fee)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">{t('calendar.status')}</Typography>
                                    <Box>
                                        <Chip
                                            label={SESSION_STATUS_LABELS[selectedEvent.session.status]}
                                            size="small"
                                            sx={{
                                                bgcolor: `${SESSION_STATUS_COLORS[selectedEvent.session.status]}15`,
                                                color: SESSION_STATUS_COLORS[selectedEvent.session.status],
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">{t('calendar.payment')}</Typography>
                                    <Box>
                                        <Chip label={PAYMENT_STATUS_LABELS[selectedEvent.session.paymentStatus]} size="small" />
                                    </Box>
                                </Grid>
                                {selectedEvent.session.notes && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">{t('calendar.notes')}</Typography>
                                        <Typography variant="body2">{selectedEvent.session.notes}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDetailDialogOpen(false)}>{t('calendar.close')}</Button>
                    {selectedEvent?.client && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDetailDialogOpen(false);
                                navigate(`/clients/${selectedEvent.client.id}`);
                            }}
                        >
                            {t('calendar.goToClient')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Yeni Randevu Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('calendar.newAppointmentTitle')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('calendar.client')}</InputLabel>
                                <Select
                                    value={newSession.clientId}
                                    label={t('calendar.client')}
                                    onChange={(e) => setNewSession({ ...newSession, clientId: e.target.value })}
                                >
                                    {clients
                                        .filter((c) => c.isActive)
                                        .map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.firstName} {c.lastName}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('calendar.date')}
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={newSession.date}
                                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('calendar.time')}
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={newSession.time}
                                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('calendar.durationMin')}
                                type="number"
                                fullWidth
                                value={newSession.duration}
                                onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label={t('calendar.feeLabel')}
                                type="number"
                                fullWidth
                                value={newSession.fee}
                                onChange={(e) => setNewSession({ ...newSession, fee: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t('calendar.notes')}
                                fullWidth
                                multiline
                                rows={2}
                                value={newSession.notes}
                                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setAddDialogOpen(false)} disabled={saving}>{t('calendar.cancel')}</Button>
                    <Button variant="contained" onClick={handleAddSession} disabled={saving}>
                        {saving ? t('calendar.saving') : t('calendar.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Calendar;
