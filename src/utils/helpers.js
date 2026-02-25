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
    HIWELL: 'hiwell',
};

export const SESSION_TYPE_COLORS = {
    [SESSION_TYPE.FACE_TO_FACE]: '#1976d2',  // mavi
    [SESSION_TYPE.ONLINE]: '#4CAF50',         // yeşil
    [SESSION_TYPE.HIWELL]: '#9C27B0',         // mor
};

// ===================== PLAN =====================
export const PLAN = {
    FREE: 'free',
    PREMIUM: 'premium',
};

export const TRIAL_DAYS = 14;
export const FREE_CLIENT_LIMIT = 5;

export const PREMIUM_FEATURES = {
    NOTIFICATIONS: 'notifications',
    EXPORT: 'export',
    SESSION_NOTES: 'session_notes',
    ADVANCED_STATS: 'advanced_stats',
    UNLIMITED_CLIENTS: 'unlimited_clients',
};

// Plan hesaplama yardımcıları
export const calculatePlanInfo = (user) => {
    if (!user) return { plan: PLAN.FREE, isTrial: false, trialDaysLeft: 0, isPremium: false };

    const now = new Date();
    const plan = user.plan || PLAN.PREMIUM; // default premium (trial)
    const trialEnd = user.trialEnd ? new Date(user.trialEnd) : 
        user.createdAt ? new Date(new Date(user.createdAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000) :
        new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const subscriptionEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : null;

    const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isTrialActive = plan === PLAN.PREMIUM && trialDaysLeft > 0 && !subscriptionEnd;
    const isSubscriptionActive = subscriptionEnd && subscriptionEnd > now;
    const isPremium = isTrialActive || isSubscriptionActive || plan === PLAN.PREMIUM;

    // Trial bittiyse ve abonelik yoksa → free plana düş
    const effectivePlan = isPremium ? PLAN.PREMIUM : PLAN.FREE;

    return {
        plan: effectivePlan,
        isTrial: isTrialActive,
        trialDaysLeft,
        trialEnd,
        isPremium: effectivePlan === PLAN.PREMIUM,
        isSubscriptionActive: !!isSubscriptionActive,
        subscriptionEnd,
    };
};

export const canUseFeature = (planInfo, feature) => {
    if (planInfo.isPremium) return true;
    // Ücretsiz planda kullanılabilir özellikler
    const freeFeatures = ['basic_calendar', 'basic_dashboard', 'session_types'];
    return freeFeatures.includes(feature);
};

export const DEFAULT_SESSION_FEE = 2000;

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};
