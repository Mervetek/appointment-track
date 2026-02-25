import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Chip, List, ListItem, ListItemIcon, ListItemText,
    Divider, Paper, Stack
} from '@mui/material';
import {
    Star as StarIcon,
    CheckCircle as CheckIcon,
    Lock as LockIcon,
    Notifications as NotifIcon,
    Description as ExportIcon,
    NoteAlt as NotesIcon,
    BarChart as StatsIcon,
    People as PeopleIcon,
} from '@mui/icons-material';

const UpgradeDialog = ({ open, onClose, reason, t }) => {
    const premiumFeatures = [
        { icon: <PeopleIcon />, key: 'plan.features.unlimitedClients' },
        { icon: <NotifIcon />, key: 'plan.features.notifications' },
        { icon: <NotesIcon />, key: 'plan.features.sessionNotes' },
        { icon: <ExportIcon />, key: 'plan.features.export' },
        { icon: <StatsIcon />, key: 'plan.features.advancedStats' },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <StarIcon sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                    {t('plan.upgradeTitle')}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {reason && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2, mb: 2,
                            bgcolor: 'warning.light',
                            borderRadius: 2,
                            textAlign: 'center',
                        }}
                    >
                        <LockIcon sx={{ color: 'warning.dark', mr: 1, verticalAlign: 'middle' }} />
                        <Typography variant="body2" component="span" color="warning.dark" fontWeight="bold">
                            {reason}
                        </Typography>
                    </Paper>
                )}

                <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
                    {t('plan.upgradeDesc')}
                </Typography>

                <List dense>
                    {premiumFeatures.map((feat, idx) => (
                        <ListItem key={idx}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <CheckIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary={t(feat.key)} />
                            <Box sx={{ ml: 1 }}>{feat.icon}</Box>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2, flex: 1, textAlign: 'center',
                            borderRadius: 2, border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary">
                            Aylık
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {t('plan.monthlyPrice')}
                        </Typography>
                    </Paper>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2, flex: 1, textAlign: 'center',
                            borderRadius: 2, border: '2px solid',
                            borderColor: 'primary.main',
                            position: 'relative',
                        }}
                    >
                        <Chip
                            label={t('plan.yearlySaving')}
                            color="success"
                            size="small"
                            sx={{
                                position: 'absolute', top: -12, right: 8,
                                fontWeight: 'bold', fontSize: '0.7rem',
                            }}
                        />
                        <Typography variant="subtitle2" color="text.secondary">
                            Yıllık
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {t('plan.yearlyPrice')}
                        </Typography>
                    </Paper>
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mt: 2, fontStyle: 'italic' }}
                >
                    {t('plan.comingSoon')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button onClick={onClose} color="inherit">
                    {t('common.cancel') || 'Kapat'}
                </Button>
                <Button
                    variant="contained"
                    startIcon={<StarIcon />}
                    onClick={onClose}
                    sx={{
                        background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
                        color: '#000',
                        fontWeight: 'bold',
                        px: 4,
                    }}
                >
                    {t('plan.upgrade')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpgradeDialog;
