import { useState } from 'react';

export function useAchievements() {
    const [earnedBadges] = useState<string[]>([]);
    const [showHatim, setShowHatim] = useState(false);

    const awardBadge = async (badgeId: string) => {
        // Disabled for now
        console.log('Achievements system is disabled. Badge not awarded:', badgeId);
    };

    return { earnedBadges, showHatim, setShowHatim, awardBadge };
}
