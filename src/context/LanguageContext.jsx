import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const stored = localStorage.getItem('psikotakip_language');
        return stored === 'en' ? 'en' : 'tr';
    });

    const toggleLanguage = () => {
        setLanguage((prev) => {
            const next = prev === 'tr' ? 'en' : 'tr';
            localStorage.setItem('psikotakip_language', next);
            return next;
        });
    };

    const t = useCallback(
        (key, params = {}) => {
            let text = translations[language]?.[key] || translations['tr']?.[key] || key;
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
            return text;
        },
        [language]
    );

    // Dil bazlı status label'ları
    const getSessionStatusLabels = useCallback(() => ({
        scheduled: t('status.scheduled'),
        completed: t('status.completed'),
        cancelled: t('status.cancelled'),
        no_show: t('status.noShow'),
    }), [t]);

    const getPaymentStatusLabels = useCallback(() => ({
        paid: t('payment.paid'),
        pending: t('payment.pending'),
        partial: t('payment.partial'),
    }), [t]);

    const getMoodOptions = useCallback(() => [
        { value: 1, label: t('mood.veryBad'), emoji: '😢', color: '#e53935' },
        { value: 2, label: t('mood.bad'), emoji: '😟', color: '#fb8c00' },
        { value: 3, label: t('mood.normal'), emoji: '😐', color: '#fdd835' },
        { value: 4, label: t('mood.good'), emoji: '🙂', color: '#7cb342' },
        { value: 5, label: t('mood.veryGood'), emoji: '😊', color: '#43a047' },
    ], [t]);

    return (
        <LanguageContext.Provider
            value={{
                language,
                toggleLanguage,
                t,
                getSessionStatusLabels,
                getPaymentStatusLabels,
                getMoodOptions,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
