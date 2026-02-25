import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    ViewList as ListViewIcon,
    ViewModule as CardViewIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePlan } from '../../hooks/usePlan';
import { formatDate } from '../../utils/helpers';

const emptyClient = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    emergencyContact: '',
    notes: '',
    diagnosis: '',
    treatmentPlan: '',
};

const ClientList = () => {
    const navigate = useNavigate();
    const { clients, sessions, loading, addClient, editClient, removeClient, showSnackbar, getSessionsByClient } = useApp();
    const { t } = useLanguage();
    const { canAddClient, clientsRemaining, clientLimit, isPremium, promptUpgrade } = usePlan(clients.length);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState(emptyClient);
    const [viewMode, setViewMode] = useState('table');
    const [saving, setSaving] = useState(false);

    const filteredClients = useMemo(() => {
        const q = search.toLowerCase();
        return clients.filter(
            (c) =>
                c.firstName.toLowerCase().includes(q) ||
                c.lastName.toLowerCase().includes(q) ||
                c.phone.includes(q) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.diagnosis && c.diagnosis.toLowerCase().includes(q))
        );
    }, [clients, search]);

    const handleOpenDialog = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({ ...client });
        } else {
            // Yeni danışan ekleme — plan kontrolü
            if (!canAddClient) {
                promptUpgrade(t('plan.clientLimitReached').replace('{limit}', clientLimit));
                return;
            }
            setEditingClient(null);
            setFormData(emptyClient);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingClient(null);
        setFormData(emptyClient);
    };

    const handleSave = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            showSnackbar(t('clients.nameRequired'), 'error');
            return;
        }
        setSaving(true);
        try {
            if (editingClient) {
                await editClient({ ...formData, id: editingClient.id });
                showSnackbar(t('clients.updated'));
            } else {
                await addClient(formData);
                showSnackbar(t('clients.added'));
            }
            handleCloseDialog();
        } catch (err) {
            showSnackbar(t('clients.error'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (client) => {
        setEditingClient(client);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setSaving(true);
        try {
            await removeClient(editingClient.id);
            showSnackbar(t('clients.deleted'), 'warning');
            setDeleteDialogOpen(false);
            setEditingClient(null);
        } catch (err) {
            showSnackbar(t('clients.deleteError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const getSessionCount = (clientId) => sessions.filter((s) => s.clientId === clientId).length;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 3 }, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>{t('clients.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('clients.count', { count: clients.length })}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} size="large">
                    {t('clients.new')}
                </Button>
            </Box>

            {/* Plan limit bilgisi */}
            {!isPremium && (
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={
                            canAddClient
                                ? t('plan.clientsRemaining').replace('{remaining}', clientsRemaining)
                                : t('plan.clientLimitReached').replace('{limit}', clientLimit)
                        }
                        color={canAddClient ? 'info' : 'warning'}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            )}

            {/* Arama & Filtre */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder={t('clients.search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, v) => v && setViewMode(v)}
                            size="small"
                        >
                            <ToggleButton value="table">
                                <ListViewIcon />
                            </ToggleButton>
                            <ToggleButton value="card">
                                <CardViewIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </CardContent>
            </Card>

            {/* Tablo Görünümü */}
            {viewMode === 'table' ? (
                <Card>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('clients.name')}</TableCell>
                                    <TableCell>{t('clients.phone')}</TableCell>
                                    <TableCell>{t('clients.diagnosis')}</TableCell>
                                    <TableCell align="center">{t('clients.session')}</TableCell>
                                    <TableCell align="center">{t('clients.status')}</TableCell>
                                    <TableCell align="right">{t('clients.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: 'primary.light', width: 38, height: 38 }}>
                                                    {client.firstName[0]}{client.lastName[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {client.firstName} {client.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {client.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>
                                            {client.diagnosis ? (
                                                <Chip label={client.diagnosis} size="small" variant="outlined" />
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">—</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">{getSessionCount(client.id)}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={client.isActive ? t('clients.active') : t('clients.passive')}
                                                size="small"
                                                color={client.isActive ? 'success' : 'default'}
                                                variant={client.isActive ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title={t('clients.view')}>
                                                <IconButton size="small" onClick={() => navigate(`/clients/${client.id}`)}>
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('clients.edit')}>
                                                <IconButton size="small" onClick={() => handleOpenDialog(client)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('clients.delete')}>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(client)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredClients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">{t('clients.notFound')}</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            ) : (
                /* Kart Görünümü */
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {filteredClients.map((client) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={client.id}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' },
                                }}
                                onClick={() => navigate(`/clients/${client.id}`)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                            {client.firstName[0]}{client.lastName[0]}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {client.firstName} {client.lastName}
                                            </Typography>
                                            <Chip
                                                label={client.isActive ? t('clients.active') : t('clients.passive')}
                                                size="small"
                                                color={client.isActive ? 'success' : 'default'}
                                            />
                                        </Box>
                                    </Box>
                                    {client.diagnosis && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            📋 {client.diagnosis}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{client.phone}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{client.email || '—'}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
                                        {getSessionCount(client.id)} {t('clients.sessions')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Danışan Ekleme/Düzenleme Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth
                sx={{ '& .MuiDialog-paper': { mx: { xs: 1, sm: 2 }, width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' } } }}
            >
                <DialogTitle>{editingClient ? t('clients.editTitle') : t('clients.addTitle')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.firstName')}
                                fullWidth
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.lastName')}
                                fullWidth
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.phone')}
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.email')}
                                fullWidth
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.birthDate')}
                                fullWidth
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('clients.gender')}</InputLabel>
                                <Select
                                    value={formData.gender}
                                    label={t('clients.gender')}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <MenuItem value="Kadın">{t('clients.genderFemale')}</MenuItem>
                                    <MenuItem value="Erkek">{t('clients.genderMale')}</MenuItem>
                                    <MenuItem value="Diğer">{t('clients.genderOther')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t('clients.emergencyContact')}
                                fullWidth
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.diagnosis')}
                                fullWidth
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('clients.treatmentPlan')}
                                fullWidth
                                value={formData.treatmentPlan}
                                onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t('clients.notes')}
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={handleCloseDialog} disabled={saving}>{t('clients.cancel')}</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? t('clients.saving') : editingClient ? t('clients.update') : t('clients.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Silme Onay Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>{t('clients.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{editingClient?.firstName} {editingClient?.lastName}</strong> {t('clients.deleteConfirm')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>{t('clients.cancel')}</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={saving}>
                        {saving ? t('clients.deleting') : t('clients.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientList;
