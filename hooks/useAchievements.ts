import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import * as Haptics from 'expo-haptics';

export function useAchievements() {
    const { userId, currentSurah, currentAyah } = useUserStore();
    const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
    const [showHatim, setShowHatim] = useState(false);

    useEffect(() => {
        const loadBadges = async () => {
            if (!userId) return;
            const ref = doc(db, 'users', userId);
            const snap = await getDoc(ref);
            if (snap.exists() && snap.data().achievements) {
                setEarnedBadges(snap.data().achievements);
            }
        };
        loadBadges();
    }, [userId]);

    const awardBadge = async (badgeId: string) => {
        if (earnedBadges.includes(badgeId)) return;
        const newBadges = [...earnedBadges, badgeId];
        setEarnedBadges(newBadges);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

        if (badgeId === 'hatim') {
            setShowHatim(true);
        }

        if (userId) {
            const ref = doc(db, 'users', userId);
            await setDoc(ref, { achievements: newBadges }, { merge: true });
        }
    };

    useEffect(() => {
        // Evaluation Logic
        if (currentSurah === 1) awardBadge('first_ayah');
        if (currentSurah > 1) awardBadge('first_surah');
        if (currentSurah >= 57) awardBadge('halfway');
        if (currentSurah === 114 && currentAyah >= 6) awardBadge('hatim');
    }, [currentSurah, currentAyah]);

    return { earnedBadges, showHatim, setShowHatim, awardBadge };
}
