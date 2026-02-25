import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { calculatePlanInfo, FREE_CLIENT_LIMIT, PREMIUM_FEATURES } from '../utils/helpers';

/**
 * usePlan — Freemium plan kontrolü
 * 
 * Kullanıcının planını, trial durumunu ve özellik erişimini yönetir.
 */
export const usePlan = (clientCount = 0) => {
    const { user } = useAuth();
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('');

    const planInfo = useMemo(() => calculatePlanInfo(user), [user]);

    // Danışan limiti kontrolü
    const canAddClient = useMemo(() => {
        if (planInfo.isPremium) return true;
        return clientCount < FREE_CLIENT_LIMIT;
    }, [planInfo.isPremium, clientCount]);

    const clientsRemaining = useMemo(() => {
        if (planInfo.isPremium) return Infinity;
        return Math.max(0, FREE_CLIENT_LIMIT - clientCount);
    }, [planInfo.isPremium, clientCount]);

    // Özellik erişim kontrolü
    const canUse = useCallback((feature) => {
        if (planInfo.isPremium) return true;
        return false; // Ücretsiz planda premium özellikler kapalı
    }, [planInfo.isPremium]);

    // Upgrade dialog tetikle
    const promptUpgrade = useCallback((reason = '') => {
        setUpgradeReason(reason);
        setShowUpgradeDialog(true);
    }, []);

    const closeUpgradeDialog = useCallback(() => {
        setShowUpgradeDialog(false);
        setUpgradeReason('');
    }, []);

    // Trial uyarı durumları
    const trialWarning = useMemo(() => {
        if (!planInfo.isTrial) return null;
        if (planInfo.trialDaysLeft <= 3) return 'critical'; // 3 gün kala
        if (planInfo.trialDaysLeft <= 7) return 'warning';   // 7 gün kala
        return null;
    }, [planInfo.isTrial, planInfo.trialDaysLeft]);

    return {
        ...planInfo,
        canAddClient,
        clientsRemaining,
        clientLimit: FREE_CLIENT_LIMIT,
        canUse,
        promptUpgrade,
        closeUpgradeDialog,
        showUpgradeDialog,
        upgradeReason,
        trialWarning,
        FEATURES: PREMIUM_FEATURES,
    };
};
