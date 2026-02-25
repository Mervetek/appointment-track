import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Star as StarIcon, AccessTime as TrialIcon } from '@mui/icons-material';

const PlanBadge = ({ planInfo, t, onClick }) => {
    if (planInfo.isPremium && planInfo.isTrial) {
        // Trial aktif
        const color = planInfo.trialDaysLeft <= 3 ? 'error' : planInfo.trialDaysLeft <= 7 ? 'warning' : 'info';
        return (
            <Tooltip title={t('plan.trialDaysLeft').replace('{days}', planInfo.trialDaysLeft)}>
                <Chip
                    icon={<TrialIcon />}
                    label={`${t('plan.trialBadge')} · ${planInfo.trialDaysLeft}${t('plan.trialDaysLeft').includes('gün') ? ' gün' : 'd'}`}
                    color={color}
                    size="small"
                    variant="outlined"
                    onClick={onClick}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                />
            </Tooltip>
        );
    }

    if (planInfo.isPremium) {
        // Premium (abonelik aktif)
        return (
            <Chip
                icon={<StarIcon />}
                label={t('plan.premiumBadge')}
                color="warning"
                size="small"
                sx={{ fontWeight: 'bold' }}
            />
        );
    }

    // Ücretsiz plan
    return (
        <Chip
            icon={<StarIcon />}
            label={t('plan.freeBadge')}
            size="small"
            variant="outlined"
            onClick={onClick}
            sx={{ cursor: 'pointer' }}
        />
    );
};

export default PlanBadge;
