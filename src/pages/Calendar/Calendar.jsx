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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useApp } from '../../context/AppContext';
import {
    SESSION_STATUS_COLORS,
    SESSION_STATUS_LABELS,
    PAYMENT_STATUS_LABELS,
    MOOD_OPTIONS,
    DEFAULT_SESSION_FEE,
    formatDateTime,
    formatCurrency,
} from '../../utils/helpers';

const Calendar = () => {
    const navigate = useNavigate();
    const { sessions, clients, addSession, getClientById, showSnackbar } = useApp();
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
                    title: client ? `${client.firstName} ${client.lastName}` : 'Bilinmeyen',
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
            showSnackbar('Danışan, tarih ve saat zorunludur', 'error');
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
            showSnackbar('Randevu eklendi');
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
            showSnackbar('Randevu eklenirken hata oluştu', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4">Takvim</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Randevularınızı görüntüleyin ve yönetin
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
                    Yeni Randevu
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        locale="tr"
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
                            today: 'Bugün',
                            month: 'Ay',
                            week: 'Hafta',
                            day: 'Gün',
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
                <DialogTitle>Seans Detayı</DialogTitle>
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
                                            : 'Bilinmeyen'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDateTime(selectedEvent.session.date)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Süre</Typography>
                                    <Typography>{selectedEvent.session.duration} dakika</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Ücret</Typography>
                                    <Typography>{formatCurrency(selectedEvent.session.fee)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Durum</Typography>
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
                                    <Typography variant="caption" color="text.secondary">Ödeme</Typography>
                                    <Box>
                                        <Chip label={PAYMENT_STATUS_LABELS[selectedEvent.session.paymentStatus]} size="small" />
                                    </Box>
                                </Grid>
                                {selectedEvent.session.notes && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Notlar</Typography>
                                        <Typography variant="body2">{selectedEvent.session.notes}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                    {selectedEvent?.client && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDetailDialogOpen(false);
                                navigate(`/clients/${selectedEvent.client.id}`);
                            }}
                        >
                            Danışana Git
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Yeni Randevu Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni Randevu</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Danışan</InputLabel>
                                <Select
                                    value={newSession.clientId}
                                    label="Danışan"
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
                                label="Tarih"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={newSession.date}
                                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Saat"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={newSession.time}
                                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Süre (dk)"
                                type="number"
                                fullWidth
                                value={newSession.duration}
                                onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Ücret (₺)"
                                type="number"
                                fullWidth
                                value={newSession.fee}
                                onChange={(e) => setNewSession({ ...newSession, fee: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Notlar"
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
                    <Button onClick={() => setAddDialogOpen(false)} disabled={saving}>İptal</Button>
                    <Button variant="contained" onClick={handleAddSession} disabled={saving}>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Calendar;
