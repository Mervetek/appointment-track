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
            showSnackbar('Ad ve soyad zorunludur', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editingClient) {
                await editClient({ ...formData, id: editingClient.id });
                showSnackbar('Danışan güncellendi');
            } else {
                await addClient(formData);
                showSnackbar('Yeni danışan eklendi');
            }
            handleCloseDialog();
        } catch (err) {
            showSnackbar('İşlem sırasında hata oluştu', 'error');
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
            showSnackbar('Danışan silindi', 'warning');
            setDeleteDialogOpen(false);
            setEditingClient(null);
        } catch (err) {
            showSnackbar('Silme sırasında hata oluştu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getSessionCount = (clientId) => sessions.filter((s) => s.clientId === clientId).length;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4">Danışanlar</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {clients.length} danışan kayıtlı
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} size="large">
                    Yeni Danışan
                </Button>
            </Box>

            {/* Arama & Filtre */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder="Danışan ara (ad, telefon, tanı...)"
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
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Danışan</TableCell>
                                    <TableCell>Telefon</TableCell>
                                    <TableCell>Tanı</TableCell>
                                    <TableCell align="center">Seans</TableCell>
                                    <TableCell align="center">Durum</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
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
                                                label={client.isActive ? 'Aktif' : 'Pasif'}
                                                size="small"
                                                color={client.isActive ? 'success' : 'default'}
                                                variant={client.isActive ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title="Görüntüle">
                                                <IconButton size="small" onClick={() => navigate(`/clients/${client.id}`)}>
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Düzenle">
                                                <IconButton size="small" onClick={() => handleOpenDialog(client)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
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
                                            <Typography color="text.secondary">Danışan bulunamadı</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            ) : (
                /* Kart Görünümü */
                <Grid container spacing={2}>
                    {filteredClients.map((client) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={client.id}>
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
                                                label={client.isActive ? 'Aktif' : 'Pasif'}
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
                                        {getSessionCount(client.id)} seans
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Danışan Ekleme/Düzenleme Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingClient ? 'Danışan Düzenle' : 'Yeni Danışan Ekle'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Ad"
                                fullWidth
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Soyad"
                                fullWidth
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Telefon"
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="E-posta"
                                fullWidth
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Doğum Tarihi"
                                fullWidth
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Cinsiyet</InputLabel>
                                <Select
                                    value={formData.gender}
                                    label="Cinsiyet"
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <MenuItem value="Kadın">Kadın</MenuItem>
                                    <MenuItem value="Erkek">Erkek</MenuItem>
                                    <MenuItem value="Diğer">Diğer</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Acil Durum İletişim"
                                fullWidth
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Tanı"
                                fullWidth
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Tedavi Planı"
                                fullWidth
                                value={formData.treatmentPlan}
                                onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Notlar"
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
                    <Button onClick={handleCloseDialog} disabled={saving}>İptal</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? 'Kaydediliyor...' : editingClient ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Silme Onay Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Danışanı Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{editingClient?.firstName} {editingClient?.lastName}</strong> adlı danışanı ve tüm seans kayıtlarını silmek istediğinize emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>İptal</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={saving}>
                        {saving ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientList;
