import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/helpers';
import dayjs from 'dayjs';

const COLORS = ['#5C6BC0', '#26A69A', '#fb8c00', '#e53935', '#43a047', '#8E99E8'];

const Reports = () => {
    const { sessions, clients } = useApp();
    const { t, getSessionStatusLabels, getMoodOptions } = useLanguage();
    const SESSION_STATUS_LABELS = getSessionStatusLabels();
    const MOOD_OPTIONS = getMoodOptions();

    // Aylık Gelir
    const monthlyRevenue = useMemo(() => {
        const map = {};
        sessions
            .filter((s) => s.paymentStatus === 'paid')
            .forEach((s) => {
                const month = dayjs(s.date).format('YYYY-MM');
                const label = dayjs(s.date).format('MMM YYYY');
                if (!map[month]) map[month] = { month, label, revenue: 0, count: 0 };
                map[month].revenue += s.fee || 0;
                map[month].count += 1;
            });
        return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
    }, [sessions]);

    // Seans Durumu Dağılımı
    const statusDistribution = useMemo(() => {
        const map = {};
        sessions.forEach((s) => {
            const label = SESSION_STATUS_LABELS[s.status] || s.status;
            if (!map[s.status]) map[s.status] = { name: label, value: 0 };
            map[s.status].value += 1;
        });
        return Object.values(map);
    }, [sessions]);

    // Haftalık Seans Sayısı
    const weeklySessions = useMemo(() => {
        const weeks = [];
        for (let i = 5; i >= 0; i--) {
            const start = dayjs().subtract(i, 'week').startOf('week');
            const end = start.endOf('week');
            const label = `${start.format('DD.MM')} - ${end.format('DD.MM')}`;
            const count = sessions.filter((s) => {
                const d = dayjs(s.date);
                return d.isAfter(start) && d.isBefore(end);
            }).length;
            weeks.push({ label, count });
        }
        return weeks;
    }, [sessions]);

    // Mood Dağılımı
    const moodDistribution = useMemo(() => {
        const map = {};
        sessions
            .filter((s) => s.mood)
            .forEach((s) => {
                const mood = MOOD_OPTIONS.find((m) => m.value === s.mood);
                if (mood) {
                    if (!map[s.mood]) map[s.mood] = { name: `${mood.emoji} ${mood.label}`, value: 0, color: mood.color };
                    map[s.mood].value += 1;
                }
            });
        return Object.values(map);
    }, [sessions]);

    // Danışan başına seans sayısı (top 5)
    const clientSessionCounts = useMemo(() => {
        const map = {};
        sessions.forEach((s) => {
            if (!map[s.clientId]) map[s.clientId] = 0;
            map[s.clientId] += 1;
        });
        return Object.entries(map)
            .map(([clientId, count]) => {
                const c = clients.find((cl) => cl.id === clientId);
                return { name: c ? `${c.firstName} ${c.lastName[0]}.` : '?', sessions: count };
            })
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 5);
    }, [sessions, clients]);

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const totalRevenue = sessions.filter((s) => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.fee || 0), 0);
    const avgFee = completedSessions > 0 ? totalRevenue / completedSessions : 0;

    return (
        <Box>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>{t('reports.title')}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('reports.subtitle')}
                </Typography>
            </Box>

            {/* Özet */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                            <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>{totalSessions}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('reports.totalSessions')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                            <Typography variant="h4" fontWeight={700} color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>{completedSessions}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('reports.completed')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                            <Typography variant="h5" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>{formatCurrency(totalRevenue)}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('reports.totalRevenue')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                            <Typography variant="h5" fontWeight={700} color="secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>{formatCurrency(avgFee)}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('reports.avgFee')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {/* Aylık Gelir */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>{t('reports.monthlyRevenue')}</Typography>
                            {monthlyRevenue.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>{t('reports.noData')}</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" fontSize={12} />
                                        <YAxis tickFormatter={(v) => `₺${v / 1000}k`} fontSize={12} />
                                        <Tooltip formatter={(v) => [formatCurrency(v), t('reports.revenue')]} />
                                        <Bar dataKey="revenue" fill="#5C6BC0" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Seans Durumu Dağılımı */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>{t('reports.sessionStatuses')}</Typography>
                            {statusDistribution.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>{t('reports.noData')}</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Haftalık Seans Sayısı */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>{t('reports.weeklySessions')}</Typography>
                            <ResponsiveContainer width="100%" height={230}>
                                <LineChart data={weeklySessions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" fontSize={10} />
                                    <YAxis allowDecimals={false} fontSize={12} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#26A69A" strokeWidth={3} dot={{ r: 4 }} name={t('reports.session')} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Danışan Seans Sayıları */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>{t('reports.clientSessions')}</Typography>
                            {clientSessionCounts.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>{t('reports.noData')}</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height={230}>
                                    <BarChart data={clientSessionCounts} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} fontSize={12} />
                                        <YAxis dataKey="name" type="category" width={80} fontSize={11} />
                                        <Tooltip />
                                        <Bar dataKey="sessions" fill="#26A69A" radius={[0, 6, 6, 0]} name={t('reports.session')} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Mood Dağılımı */}
                {moodDistribution.length > 0 && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                                <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>{t('reports.moodDistribution')}</Typography>
                                <ResponsiveContainer width="100%" height={230}>
                                    <PieChart>
                                        <Pie
                                            data={moodDistribution}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {moodDistribution.map((entry, index) => (
                                                <Cell key={`mood-${index}`} fill={entry.color || COLORS[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default Reports;
