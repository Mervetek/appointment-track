import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export const generateId = () => uuidv4();

export const formatDate = (date, format = 'DD.MM.YYYY') => {
    return dayjs(date).format(format);
};

export const formatTime = (date) => {
    return dayjs(date).format('HH:mm');
};

export const formatDateTime = (date) => {
    return dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const isToday = (date) => {
    return dayjs(date).isSame(dayjs(), 'day');
};

export const isFuture = (date) => {
    return dayjs(date).isAfter(dayjs());
};

export const getWeekDay = (date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayjs(date).day()];
};

export const MOOD_OPTIONS = [
    { value: 1, label: 'Çok Kötü', emoji: '😢', color: '#e53935' },
    { value: 2, label: 'Kötü', emoji: '😟', color: '#fb8c00' },
    { value: 3, label: 'Normal', emoji: '😐', color: '#fdd835' },
    { value: 4, label: 'İyi', emoji: '🙂', color: '#7cb342' },
    { value: 5, label: 'Çok İyi', emoji: '😊', color: '#43a047' },
];

export const SESSION_STATUS = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
};

export const SESSION_STATUS_LABELS = {
    [SESSION_STATUS.SCHEDULED]: 'Planlandı',
    [SESSION_STATUS.COMPLETED]: 'Tamamlandı',
    [SESSION_STATUS.CANCELLED]: 'İptal Edildi',
    [SESSION_STATUS.NO_SHOW]: 'Gelmedi',
};

export const SESSION_STATUS_COLORS = {
    [SESSION_STATUS.SCHEDULED]: '#1976d2',
    [SESSION_STATUS.COMPLETED]: '#43a047',
    [SESSION_STATUS.CANCELLED]: '#e53935',
    [SESSION_STATUS.NO_SHOW]: '#fb8c00',
};

export const PAYMENT_STATUS = {
    PAID: 'paid',
    PENDING: 'pending',
    PARTIAL: 'partial',
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PAID]: 'Ödendi',
    [PAYMENT_STATUS.PENDING]: 'Bekliyor',
    [PAYMENT_STATUS.PARTIAL]: 'Kısmi Ödeme',
};

export const PAYMENT_STATUS_COLORS = {
    [PAYMENT_STATUS.PAID]: '#43a047',
    [PAYMENT_STATUS.PENDING]: '#fb8c00',
    [PAYMENT_STATUS.PARTIAL]: '#1976d2',
};

// ===================== SESSION TYPE =====================
export const SESSION_TYPE = {
    FACE_TO_FACE: 'face_to_face',
    ONLINE: 'online',
};

export const SESSION_TYPE_COLORS = {
    [SESSION_TYPE.FACE_TO_FACE]: '#5C6BC0',
    [SESSION_TYPE.ONLINE]: '#00ACC1',
};

// ===================== CLIENT COLORS =====================
// Danışanlara sabit renk atamak için palet
const CLIENT_COLOR_PALETTE = [
    '#5C6BC0', '#26A69A', '#EF5350', '#AB47BC', '#FF7043',
    '#66BB6A', '#42A5F5', '#FFA726', '#EC407A', '#8D6E63',
    '#78909C', '#7E57C2', '#29B6F6', '#D4E157', '#FFCA28',
    '#26C6DA', '#9CCC65', '#FF8A65', '#CE93D8', '#A1887F',
];

export const getClientColor = (clientId) => {
    if (!clientId) return CLIENT_COLOR_PALETTE[0];
    // Basit hash — aynı clientId her zaman aynı rengi alır
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
        hash = ((hash << 5) - hash) + clientId.charCodeAt(i);
        hash |= 0;
    }
    return CLIENT_COLOR_PALETTE[Math.abs(hash) % CLIENT_COLOR_PALETTE.length];
};

export const DEFAULT_SESSION_FEE = 2000;

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};
